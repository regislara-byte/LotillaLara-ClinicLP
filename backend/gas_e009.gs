/**
 * ================================================================
 * gas_e009.gs — LL-OPTICALV2 Operations Backend
 * IMPLEMENTATION_009 · Google Apps Script Web App
 * Version: 009-B (synced to deployed Sheet structure)
 *
 * SHEET STRUCTURE (matches live deployment)
 * ─────────────────────────────────────────
 * Tab 1: Inquiries    — all patient form submissions
 * Tab 2: Appointments — confirmed appointment tracking
 * Tab 3: Reports      — daily/weekly report archive
 * Tab 4: Analytics    — aggregated metric snapshots
 * Tab 5: FollowUps    — pending follow-up queue
 * Tab 6: AuditLog     — system event log
 * Tab 7: Settings     — clinic config key-value store
 *
 * DEPLOYMENT STEPS (do once)
 * ──────────────────────────
 * 1. Paste this file into script.google.com
 * 2. Update CONFIG.SHEET_ID with your Sheet ID
 * 3. Update CONFIG.CHAT_WEBHOOK with your Chat webhook URL
 * 4. Run initializeSheets() once — creates/syncs all tabs
 * 5. Run installTriggers() once — daily 6PM + weekly Monday
 * 6. Deploy → Web App → Anyone → copy /exec URL
 * 7. Paste /exec URL into:
 *       script.js  → const GAS_ENDPOINT = '...'
 *       admin.html → const GAS_ENDPOINT = '...'
 * ================================================================
 */

/* ================================================================
   CONFIG
================================================================ */
const CONFIG = {
  SHEET_ID:      'YOUR_GOOGLE_SHEET_ID_HERE',
  CHAT_WEBHOOK:  'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE',
  OWNER_EMAIL:   'laraeldie1956@gmail.com',
  CLINIC_NAME:   'Lotilla-Lara Optical Clinic',
  TIMEZONE:      'Asia/Manila',
  EOD_HOUR:      18,
  ADMIN_VERSION: '009',
};

/* ================================================================
   TAB NAMES — synced to live Sheet
================================================================ */
const TABS = {
  INQUIRIES:    'Inquiries',
  APPOINTMENTS: 'Appointments',
  REPORTS:      'Reports',
  ANALYTICS:    'Analytics',
  FOLLOWUPS:    'FollowUps',
  AUDIT_LOG:    'AuditLog',
  SETTINGS:     'Settings',
};

/* ================================================================
   doPost() — receives form submissions from LP
   Body: { name, phone, email?, reason, preferredDate, message, source }
================================================================ */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = submitInquiry(data);
    return jsonResponse({ success: true, inquiryId: result.inquiryId });
  } catch (err) {
    auditLog('doPost:ERROR', 'system', err.message);
    return jsonResponse({ success: false, error: err.message });
  }
}

/* ================================================================
   doGet() — serves admin dashboard + action triggers
================================================================ */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getDashboard';
  try {
    let result;
    switch (action) {
      case 'getDashboard':         result = getDashboardData();            break;
      case 'generateDailySummary': result = generateDailySummary();        break;
      case 'generateWeeklySummary':result = generateWeeklySummary();       break;
      case 'exportDailyReportPDF': result = { url: exportDailyReportPDF() }; break;
      case 'getHealth':            result = getSystemHealth();             break;
      case 'getAnalytics':         result = getAnalyticsData();            break;
      default:                     result = { error: 'Unknown action.' };
    }
    return jsonResponse(result);
  } catch (err) {
    auditLog('doGet:' + action + ':ERROR', 'system', err.message);
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================================================================
   E009-001 — submitInquiry()
   Columns: InquiryID | Timestamp | Name | Phone | Email |
            Service | Message | Source | Status | AssignedTo
================================================================ */
function submitInquiry(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.INQUIRIES);
  if (!sheet) throw new Error('Inquiries tab not found. Run initializeSheets().');

  const now       = new Date();
  const inquiryId = 'INQ-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMdd') +
                    '-' + String(sheet.getLastRow()).padStart(4, '0');

  const serviceMap = {
    'first-exam':  'First Eye Examination',
    'follow-up':   'Follow-Up / Check-Up',
    'frames-only': 'Frame Selection',
    'pediatric':   'Pediatric Eye Exam',
    'contacts':    'Contact Lens Fitting',
    'other':       'Other / General Inquiry',
  };
  const service = serviceMap[data.reason] || data.reason || 'Not specified';

  sheet.appendRow([
    inquiryId,                          // A: InquiryID
    now.toISOString(),                  // B: Timestamp
    data.name        || '',             // C: Name
    data.phone       || '',             // D: Phone
    data.email       || '',             // E: Email
    service,                            // F: Service
    data.message     || '',             // G: Message
    data.source      || 'Website',      // H: Source
    'New',                              // I: Status
    '',                                 // J: AssignedTo (staff fills)
  ]);

  // E009-004 — Chat alert
  sendChatAlert({ inquiryId, name: data.name, phone: data.phone, service,
                  preferredDate: data.preferredDate, time: Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm') });

  // E009-020 — Analytics snapshot
  recordAnalytic('inquiry_received', 1, service);

  // AuditLog
  auditLog('inquiry_submitted', data.name || 'unknown', `InquiryID: ${inquiryId}, Service: ${service}`);

  // Auto-create follow-up if date given
  if (data.preferredDate && data.preferredDate !== 'Not specified') {
    addFollowUp({ inquiryId, name: data.name, phone: data.phone,
                  reason: service, dueDate: data.preferredDate });
  }

  return { inquiryId };
}

/* ================================================================
   E009-002 — getDashboardData()
   Returns full JSON payload for admin.html
================================================================ */
function getDashboardData() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const fuSht   = ss.getSheetByName(TABS.FOLLOWUPS);
  const repSht  = ss.getSheetByName(TABS.REPORTS);
  const audSht  = ss.getSheetByName(TABS.AUDIT_LOG);

  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');

  // Inquiries — all rows
  const inqRows = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  // Today only — match date portion of ISO timestamp (col B)
  const todayInq = inqRows.filter(r => r[1] && String(r[1]).startsWith(today));

  // Build inquiry objects (last 25, newest first)
  const inquiries = [...todayInq].reverse().slice(0, 25).map(r => ({
    inquiryId:     r[0],
    timestamp:     r[1],
    name:          r[2],
    phone:         r[3],
    email:         r[4],
    service:       r[5],
    message:       r[6],
    source:        r[7],
    status:        r[8] || 'New',
    assignedTo:    r[9],
  }));

  // KPIs
  const kpis = buildKPIs(todayInq, inqRows);

  // Follow-ups (pending only, nearest due date first)
  const fuRows = fuSht ? fuSht.getDataRange().getValues().slice(1) : [];
  const followups = fuRows
    .filter(r => !['Completed','Cancelled'].includes(r[4]))
    .sort((a, b) => new Date(a[6]) - new Date(b[6]))
    .slice(0, 15)
    .map(r => ({
      followUpId:  r[0],
      inquiryId:   r[1],
      name:        r[2],
      phone:       r[3],
      status:      r[4],
      assignedTo:  r[5],
      dueDate:     r[6],
      notes:       r[7],
    }));

  // Recent reports (last 7)
  const repRows = repSht ? repSht.getDataRange().getValues().slice(1) : [];
  const recentReports = repRows.slice(-7).reverse().map(r => ({
    reportId:    r[0],
    date:        r[1],
    type:        r[2],
    inquiries:   r[3],
    appointments:r[4],
    notes:       r[5],
    generatedAt: r[6],
  }));

  // Recent audit log (last 10)
  const audRows = audSht ? audSht.getDataRange().getValues().slice(1) : [];
  const auditEntries = audRows.slice(-10).reverse().map(r => ({
    logId:     r[0],
    timestamp: r[1],
    action:    r[2],
    user:      r[3],
    details:   r[4],
    notes:     r[5],
  }));

  // System health
  const health = getSystemHealth();

  return {
    kpis, inquiries, followups,
    recentReports, auditEntries,
    health,
    generatedAt: new Date().toISOString(),
    today,
  };
}

function buildKPIs(todayRows, allRows) {
  const statuses = todayRows.map(r => String(r[8] || 'New').toLowerCase());
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekRows = allRows.filter(r => r[1] && new Date(r[1]) >= weekAgo);

  return {
    // Today
    totalInquiries:    todayRows.length,
    confirmed:         statuses.filter(s => ['scheduled','completed'].includes(s)).length,
    pendingFollowups:  statuses.filter(s => ['new','contacted'].includes(s)).length,
    cancelled:         statuses.filter(s => s === 'cancelled').length,
    frameConsults:     todayRows.filter(r => String(r[5]).toLowerCase().includes('frame')).length,
    pediatric:         todayRows.filter(r => String(r[5]).toLowerCase().includes('pediatric')).length,
    sports:            todayRows.filter(r => String(r[5]).toLowerCase().includes('sport')).length,
    // Weekly
    weeklyInquiries:   weekRows.length,
    weeklyConfirmed:   weekRows.filter(r => ['scheduled','completed'].includes(String(r[8]||'').toLowerCase())).length,
  };
}

/* ================================================================
   E009-003 — generateDailySummary()
   Writes to Reports tab + creates Google Doc + emails owner
================================================================ */
function generateDailySummary() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const repSht  = ss.getSheetByName(TABS.REPORTS);

  const today    = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const allRows  = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const todayInq = allRows.filter(r => r[1] && String(r[1]).startsWith(today));
  const kpis     = buildKPIs(todayInq, allRows);

  // Create Google Doc
  const docTitle = `${CONFIG.CLINIC_NAME} — Daily Report ${today}`;
  const doc      = DocumentApp.create(docTitle);
  const body     = doc.getBody();

  appendDocHeader(body, 'Daily Operations Report', today);

  // Inquiry Summary
  body.appendParagraph('INQUIRY SUMMARY').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  [
    ['Total Inquiries',        kpis.totalInquiries],
    ['Confirmed / Scheduled',  kpis.confirmed],
    ['Pending Follow-Ups',     kpis.pendingFollowups],
    ['Cancelled',              kpis.cancelled],
  ].forEach(([l, v]) => body.appendParagraph(`${l}: ${v}`));
  body.appendHorizontalRule();

  // Service Breakdown
  body.appendParagraph('SERVICE BREAKDOWN').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  const serviceCounts = {};
  todayInq.forEach(r => {
    const s = String(r[5] || 'Other');
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });
  Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([s, n]) => body.appendParagraph(`${s}: ${n}`));
  body.appendHorizontalRule();

  // Inquiry log table
  if (todayInq.length) {
    body.appendParagraph('INQUIRY LOG').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const tbl = body.appendTable();
    const hdr = tbl.appendTableRow();
    ['InquiryID', 'Time', 'Name', 'Service', 'Status'].forEach(h => hdr.appendTableCell(h));
    todayInq.forEach(r => {
      const row = tbl.appendTableRow();
      const time = r[1] ? Utilities.formatDate(new Date(r[1]), CONFIG.TIMEZONE, 'HH:mm') : '';
      [String(r[0]||''), time, String(r[2]||''), String(r[5]||''), String(r[8]||'New')]
        .forEach(v => row.appendTableCell(v));
    });
  }

  body.appendHorizontalRule();
  body.appendParagraph('Report generated by EYLOTL™ Reporting System · ' + CONFIG.CLINIC_NAME);
  doc.saveAndClose();

  const docUrl = doc.getUrl();
  const reportId = 'RPT-' + today + '-DAILY';

  // Write to Reports tab
  // Columns: ReportID | Date | ReportType | TotalInquiries | TotalAppointments | Notes | GeneratedAt
  if (repSht) {
    repSht.appendRow([
      reportId, today, 'Daily',
      kpis.totalInquiries, kpis.confirmed,
      docUrl,
      new Date().toISOString(),
    ]);
  }

  // E009-019 — Generate markdown export
  generateMarkdownReport('daily', today, kpis, serviceCounts);

  // E009-020 — Analytics
  recordAnalytic('daily_report_generated', 1, 'Reports');

  // Email + Chat
  sendOwnerEmail(
    `${CONFIG.CLINIC_NAME} — Daily Report ${today}`,
    buildEmailBody(today, kpis, docUrl)
  );
  sendChatMessage(
    `📋 *Daily Report — ${today}*\n` +
    `Inquiries: ${kpis.totalInquiries} | Confirmed: ${kpis.confirmed} | Pending: ${kpis.pendingFollowups}\n` +
    `Frame Consults: ${kpis.frameConsults} | Pediatric: ${kpis.pediatric}\n` +
    `📄 ${docUrl}`
  );

  auditLog('daily_report_generated', 'system', `ReportID: ${reportId}, Doc: ${docUrl}`);

  return { success: true, reportId, docUrl, message: `Daily report generated: ${docUrl}` };
}

/* ================================================================
   Weekly Summary
================================================================ */
function generateWeeklySummary() {
  const ss     = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht = ss.getSheetByName(TABS.INQUIRIES);
  const repSht = ss.getSheetByName(TABS.REPORTS);

  const now      = new Date();
  const weekAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const allRows  = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const weekRows = allRows.filter(r => r[1] && new Date(r[1]) >= weekAgo);
  const kpis     = buildKPIs(weekRows, allRows);

  const weekEnd   = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const weekStart = Utilities.formatDate(weekAgo, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  // Service counts
  const serviceCounts = {};
  weekRows.forEach(r => {
    const s = String(r[5] || 'Other');
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });

  const docTitle = `${CONFIG.CLINIC_NAME} — Weekly Report ${weekStart} to ${weekEnd}`;
  const doc  = DocumentApp.create(docTitle);
  const body = doc.getBody();

  appendDocHeader(body, `Weekly Operations Report — ${weekStart} to ${weekEnd}`, weekEnd);

  body.appendParagraph('WEEKLY TOTALS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  [
    ['Total Inquiries',        kpis.totalInquiries],
    ['Confirmed / Scheduled',  kpis.confirmed],
    ['Frame Consultations',    kpis.frameConsults],
    ['Pediatric Inquiries',    kpis.pediatric],
    ['Sports & Active',        kpis.sports],
    ['Cancelled',              kpis.cancelled],
  ].forEach(([l, v]) => body.appendParagraph(`${l}: ${v}`));
  body.appendHorizontalRule();

  body.appendParagraph('SERVICE DEMAND').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([s, n]) => body.appendParagraph(`${s}: ${n}`));

  doc.saveAndClose();
  const docUrl = doc.getUrl();
  const reportId = `RPT-${weekEnd}-WEEKLY`;

  if (repSht) {
    repSht.appendRow([reportId, weekEnd, 'Weekly',
      kpis.totalInquiries, kpis.confirmed, docUrl, new Date().toISOString()]);
  }

  generateMarkdownReport('weekly', weekEnd, kpis, serviceCounts, weekStart);
  recordAnalytic('weekly_report_generated', 1, 'Reports');

  sendChatMessage(
    `📊 *Weekly Report — ${weekStart} to ${weekEnd}*\n` +
    `Total: ${kpis.totalInquiries} inquiries | Confirmed: ${kpis.confirmed}\n` +
    `📄 ${docUrl}`
  );
  auditLog('weekly_report_generated', 'system', `ReportID: ${reportId}`);

  return { success: true, reportId, docUrl, message: `Weekly report: ${docUrl}` };
}

/* ================================================================
   PDF Export
================================================================ */
function exportDailyReportPDF() {
  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const files = DriveApp.getFilesByName(`${CONFIG.CLINIC_NAME} — Daily Report ${today}`);

  if (!files.hasNext()) {
    generateDailySummary();
    return 'Summary generated. Call export again.';
  }

  const docFile = files.next();
  const blob    = UrlFetchApp.fetch(
    `https://docs.google.com/document/d/${docFile.getId()}/export?format=pdf`,
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }
  ).getBlob().setName(`LL-OPTICAL-Daily-${today}.pdf`);

  const folder  = docFile.getParents().hasNext() ? docFile.getParents().next() : DriveApp.getRootFolder();
  const pdfFile = folder.createFile(blob);
  recordAnalytic('pdf_exported', 1, 'Reports');
  return pdfFile.getUrl();
}

/* ================================================================
   E009-004 — Google Chat
================================================================ */
function sendChatAlert(info) {
  const chatEnabled = getSettingValue('CHAT_ENABLED');
  if (chatEnabled === 'FALSE' || chatEnabled === 'false') return;

  sendChatMessage(
    `🔔 *New Inquiry — ${info.inquiryId || ''}*\n` +
    `*Name:* ${info.name || 'Unknown'}\n` +
    `*Service:* ${info.service || 'Not specified'}\n` +
    `*Preferred Date:* ${info.preferredDate || 'Not specified'}\n` +
    `*Received:* ${info.time || ''}\n` +
    `_${CONFIG.CLINIC_NAME} · Website_`
  );
}

function sendChatMessage(text) {
  if (!CONFIG.CHAT_WEBHOOK || CONFIG.CHAT_WEBHOOK === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE') {
    console.log('Chat not configured. Message:', text);
    return;
  }
  try {
    UrlFetchApp.fetch(CONFIG.CHAT_WEBHOOK, {
      method:      'post',
      contentType: 'application/json',
      payload:     JSON.stringify({ text }),
    });
    recordAnalytic('chat_alert_sent', 1, 'Automation');
  } catch (err) {
    auditLog('sendChatMessage:ERROR', 'system', err.message);
  }
}

/* ================================================================
   E009-005 — Follow-Up Queue
   Columns: FollowUpID | InquiryID | PatientName | Phone |
            Status | AssignedTo | DueDate | Notes
================================================================ */
function addFollowUp(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.FOLLOWUPS);
  if (!sheet) return;

  const followUpId = 'FU-' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyyMMddHHmmss');

  sheet.appendRow([
    followUpId,          // A: FollowUpID
    data.inquiryId || '',// B: InquiryID
    data.name     || '', // C: PatientName
    data.phone    || '', // D: Phone
    'Pending',           // E: Status
    '',                  // F: AssignedTo
    data.dueDate  || '', // G: DueDate
    data.reason   || '', // H: Notes
  ]);
}

/* ================================================================
   E009-020 — System Health
================================================================ */
function getSystemHealth() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const audSht  = ss.getSheetByName(TABS.AUDIT_LOG);
  const repSht  = ss.getSheetByName(TABS.REPORTS);
  const anaSht  = ss.getSheetByName(TABS.ANALYTICS);

  const audRows = audSht ? audSht.getDataRange().getValues().slice(1) : [];
  const repRows = repSht ? repSht.getDataRange().getValues().slice(1) : [];

  const errors   = audRows.filter(r => String(r[2]).includes('ERROR')).length;
  const total    = audRows.length;
  const successRate = total > 0 ? Math.round(((total - errors) / total) * 100) : 100;

  // Last report timestamp
  const lastReport = repRows.length ? repRows[repRows.length - 1][6] : null;

  // Analytics event counts
  const anaRows = anaSht ? anaSht.getDataRange().getValues().slice(1) : [];
  const today   = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const todayAna = anaRows.filter(r => r[1] && String(r[1]).startsWith(today));

  const chatsSent    = sumMetric(todayAna, 'chat_alert_sent');
  const reportsGen   = sumMetric(todayAna, 'daily_report_generated') +
                       sumMetric(todayAna, 'weekly_report_generated');
  const pdfsExported = sumMetric(todayAna, 'pdf_exported');

  return {
    successRate,
    totalAuditEvents: total,
    errorCount:       errors,
    reportsGenerated: reportsGen,
    chatAlertsSent:   chatsSent,
    pdfsExported,
    lastReportAt:     lastReport,
    lastSyncAt:       new Date().toISOString(),
    version:          CONFIG.ADMIN_VERSION,
  };
}

function sumMetric(rows, metric) {
  return rows
    .filter(r => r[2] === metric)
    .reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
}

/* ================================================================
   E009-019 — Analytics Recording
   Columns: AnalyticsID | Date | Metric | Value | Category | Notes
================================================================ */
function recordAnalytic(metric, value, category, notes) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.ANALYTICS);
    if (!sheet) return;

    const now  = new Date();
    const id   = 'ANA-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
    sheet.appendRow([
      id,
      Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd'),
      metric,
      value,
      category || '',
      notes   || '',
    ]);
  } catch (err) {
    console.log('recordAnalytic error (non-critical):', err.message);
  }
}

function getAnalyticsData() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.ANALYTICS);
  if (!sheet) return { rows: [] };

  const rows = sheet.getDataRange().getValues().slice(1);
  const last30 = rows.slice(-200); // reasonable window

  // Aggregate by metric
  const metrics = {};
  last30.forEach(r => {
    const m = String(r[2] || '');
    if (!metrics[m]) metrics[m] = { total: 0, today: 0 };
    metrics[m].total += Number(r[3]) || 0;
  });

  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  last30.filter(r => String(r[1]).startsWith(today)).forEach(r => {
    const m = String(r[2] || '');
    if (metrics[m]) metrics[m].today += Number(r[3]) || 0;
  });

  return { metrics, generatedAt: new Date().toISOString() };
}

/* ================================================================
   E009-018 — VLA Generation
   Writes a VLA markdown entry to Drive (docs/vla/ folder)
================================================================ */
function generateVLA(data) {
  const {
    title, phase = '009', observation, insight,
    connection, futureRelevance, skills = [], nextAction,
  } = data;

  const now   = new Date();
  const date  = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss zzz');
  const index = 'VLA-' + phase + '-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmm');

  const content =
`# ${index}

## ${title}

**Project:** LL-OPTICALV2
**Project Phase:** IMPLEMENTATION_${phase}
**Timestamp:** ${date}
**Status:** Documented ✅

---

### Observation
${observation}

---

### Insight
${insight}

---

### Project Connection
${connection}

---

### Future Relevance
${futureRelevance}

---

### Skills Unlocked
${skills.map(s => `- ${s}`).join('\n')}

---

### Next Action
${nextAction}

---

*Generated by EYLOTL™ Reporting System · ${CONFIG.CLINIC_NAME}*
`;

  // Save to Drive
  const file = DriveApp.createFile(index + '.md', content, MimeType.PLAIN_TEXT);
  auditLog('vla_generated', 'system', `${index}: ${title}`);
  recordAnalytic('vla_generated', 1, 'Documentation');

  return { vlaId: index, url: file.getUrl() };
}

/* Auto-VLA trigger — first inquiry of the day */
function checkFirstInquiryVLA() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const today   = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const rows    = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const todayInq = rows.filter(r => r[1] && String(r[1]).startsWith(today));

  if (todayInq.length === 1) {
    // First inquiry of the day — generate VLA
    generateVLA({
      title:          'First Patient Inquiry Received — ' + today,
      phase:          '009',
      observation:    `First patient inquiry of ${today} captured via website booking form. Service: ${todayInq[0][5] || 'Unknown'}.`,
      insight:        'The website-to-GAS pipeline is functioning correctly. Patient data captured, Chat alert sent, follow-up queued.',
      connection:     'Validates IMPLEMENTATION_009 E009-001 (inquiry capture) and E009-004 (Chat notification).',
      futureRelevance:'Each first-inquiry-of-day event marks an active clinic day. Aggregating these dates will reveal weekly/monthly rhythm patterns for IMPLEMENTATION_011 analytics.',
      skills:         ['GAS doPost() endpoint handling', 'Sheets append operation', 'Chat webhook delivery', 'Follow-up queue population'],
      nextAction:     'Review inquiry in Sheets. Confirm Chat alert received. Update status to Contacted after first follow-up.',
    });
  }
}

/* ================================================================
   E009-019 — GitHub Markdown Report Export
   Generates privacy-safe aggregated markdown files
================================================================ */
function generateMarkdownReport(type, date, kpis, serviceCounts, weekStart) {
  const isWeekly = type === 'weekly';
  const period   = isWeekly ? `${weekStart} to ${date}` : date;
  const filename = isWeekly ? 'WEEKLY_REPORT.md' : 'DAILY_REPORT.md';

  const serviceLines = Object.entries(serviceCounts || {})
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `| ${s} | ${n} |`)
    .join('\n');

  const content =
`# ${CONFIG.CLINIC_NAME}
## ${isWeekly ? 'Weekly' : 'Daily'} Operations Report — ${period}

> **Privacy Note:** This report contains aggregated metrics only. No patient names, contact details, or personal information are included.

---

### Summary

| Metric | Value |
|--------|-------|
| Total Inquiries | ${kpis.totalInquiries} |
| Confirmed / Scheduled | ${kpis.confirmed} |
| Pending Follow-Ups | ${kpis.pendingFollowups} |
| Frame Consultations | ${kpis.frameConsults} |
| Pediatric Inquiries | ${kpis.pediatric} |
| Sports & Active | ${kpis.sports} |
| Cancelled | ${kpis.cancelled} |

---

### Service Demand

| Service | Count |
|---------|-------|
${serviceLines || '| No data | 0 |'}

---

*Generated by EYLOTL™ Reporting System · ${CONFIG.CLINIC_NAME}*
*Report Date: ${date} · Version: ${CONFIG.ADMIN_VERSION}*
`;

  try {
    // Check if file exists and update, otherwise create
    const files = DriveApp.getFilesByName(filename);
    if (files.hasNext()) {
      files.next().setContent(content);
    } else {
      DriveApp.createFile(filename, content, MimeType.PLAIN_TEXT);
    }
    recordAnalytic('markdown_report_generated', 1, 'GitHub');
  } catch (err) {
    auditLog('generateMarkdownReport:ERROR', 'system', err.message);
  }
}

/* ================================================================
   AuditLog
   Columns: LogID | Timestamp | Action | User | Details | Notes
================================================================ */
function auditLog(action, user, details, notes) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.AUDIT_LOG);
    if (!sheet) return;
    const now = new Date();
    const id  = 'LOG-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
    sheet.appendRow([id, now.toISOString(), action, user || 'system', details || '', notes || '']);
  } catch (err) {
    console.log('auditLog error (non-critical):', err.message);
  }
}

/* ================================================================
   Settings helper — reads value from Settings tab by key
================================================================ */
function getSettingValue(key) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.SETTINGS);
    if (!sheet) return null;
    const rows = sheet.getDataRange().getValues().slice(1);
    const row  = rows.find(r => r[0] === key);
    return row ? String(row[1]) : null;
  } catch (err) {
    return null;
  }
}

/* ================================================================
   Doc helper
================================================================ */
function appendDocHeader(body, subtitle, date) {
  body.appendParagraph(CONFIG.CLINIC_NAME).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(subtitle).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(`Report Date: ${date}`);
  body.appendParagraph(`Prepared by: EYLOTL™ Reporting System`);
  body.appendParagraph(`Generated: ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss zzz')}`);
  body.appendHorizontalRule();
}

function buildEmailBody(date, kpis, docUrl) {
  return `Daily Operations Summary — ${date}\n\n` +
    `Total Inquiries:        ${kpis.totalInquiries}\n` +
    `Confirmed/Scheduled:    ${kpis.confirmed}\n` +
    `Pending Follow-Ups:     ${kpis.pendingFollowups}\n` +
    `Frame Consultations:    ${kpis.frameConsults}\n` +
    `Pediatric Inquiries:    ${kpis.pediatric}\n` +
    `Sports & Active:        ${kpis.sports}\n` +
    `Cancelled:              ${kpis.cancelled}\n\n` +
    `Full Report: ${docUrl}\n\n` +
    `— EYLOTL™ Reporting System · ${CONFIG.CLINIC_NAME}`;
}

function sendOwnerEmail(subject, body) {
  try { MailApp.sendEmail(CONFIG.OWNER_EMAIL, subject, body); }
  catch (err) { auditLog('sendOwnerEmail:ERROR', 'system', err.message); }
}

/* ================================================================
   AUTOMATION TRIGGERS
================================================================ */
function endOfDayAutomation() {
  const hour = parseInt(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'HH'), 10);
  if (Math.abs(hour - CONFIG.EOD_HOUR) <= 1) {
    generateDailySummary();
    archiveOldInquiries();
    auditLog('eod_automation_ran', 'trigger', `Hour: ${hour}`);
  }
}

function archiveOldInquiries() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.INQUIRIES);
  if (!sheet) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    const rowDate = new Date(data[i][1]);
    if (rowDate < cutoff && data[i][8] !== 'Archived') {
      sheet.getRange(i + 1, 9).setValue('Archived');
    }
  }
}

/* ================================================================
   SETUP — initializeSheets()
   Run ONCE — creates/updates all 7 tabs to match live structure
================================================================ */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  const TEAL  = '#0B5394'; // header bg
  const WHITE = '#ffffff';

  const sheetDefs = [
    {
      name: TABS.INQUIRIES,
      headers: ['InquiryID','Timestamp','Name','Phone','Email',
                'Service','Message','Source','Status','AssignedTo'],
    },
    {
      name: TABS.APPOINTMENTS,
      headers: ['AppointmentID','InquiryID','Date','Time','PatientName',
                'Service','Status','Notes','CreatedAt'],
    },
    {
      name: TABS.REPORTS,
      headers: ['ReportID','Date','ReportType','TotalInquiries',
                'TotalAppointments','Notes','GeneratedAt'],
    },
    {
      name: TABS.ANALYTICS,
      headers: ['AnalyticsID','Date','Metric','Value','Category','Notes'],
    },
    {
      name: TABS.FOLLOWUPS,
      headers: ['FollowUpID','InquiryID','PatientName','Phone',
                'Status','AssignedTo','DueDate','Notes'],
    },
    {
      name: TABS.AUDIT_LOG,
      headers: ['LogID','Timestamp','Action','User','Details','Notes'],
    },
    {
      name: TABS.SETTINGS,
      headers: ['Key','Value','Description','UpdatedAt','Notes'],
    },
  ];

  sheetDefs.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) sheet = ss.insertSheet(def.name);
    const hRange = sheet.getRange(1, 1, 1, def.headers.length);
    hRange.setValues([def.headers]);
    hRange.setFontWeight('bold');
    hRange.setBackground(TEAL);
    hRange.setFontColor(WHITE);
    sheet.setFrozenRows(1);
    // Auto-resize columns
    sheet.autoResizeColumns(1, def.headers.length);
  });

  // Pre-fill Settings (only if empty)
  const settingsSht = ss.getSheetByName(TABS.SETTINGS);
  if (settingsSht.getLastRow() < 2) {
    const now = new Date().toISOString();
    const rows = [
      ['CLINIC_NAME',    CONFIG.CLINIC_NAME,           'Clinic display name',              now, ''],
      ['REPORT_TIME',    '18:00',                       'Daily Report Time',                now, ''],
      ['WEEKLY_REPORT',  'Monday',                      'Weekly Report Day',                now, ''],
      ['CHAT_ENABLED',   'TRUE',                        'Enable Google Chat Notifications', now, ''],
      ['ADMIN_VERSION',  CONFIG.ADMIN_VERSION,          'Current Backend Version',          now, ''],
    ];
    settingsSht.getRange(2, 1, rows.length, 5).setValues(rows);
  }

  // Remove default Sheet1 if still present
  const default1 = ss.getSheetByName('Sheet1');
  if (default1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(default1); } catch (e) {}
  }

  auditLog('initializeSheets', 'admin', 'All 7 tabs created/verified.');
  console.log('initializeSheets() complete — 7 tabs ready.');
}

/* ================================================================
   SETUP — installTriggers()
================================================================ */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('endOfDayAutomation')
    .timeBased().everyDays(1).atHour(CONFIG.EOD_HOUR)
    .inTimezone(CONFIG.TIMEZONE).create();

  ScriptApp.newTrigger('generateWeeklySummary')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8).inTimezone(CONFIG.TIMEZONE).create();

  console.log('Triggers installed.');
}

/* ================================================================
   TEST FUNCTIONS
================================================================ */
function testSubmitInquiry() {
  const result = submitInquiry({
    name: 'Test Patient', phone: '+63 9XX XXX XXXX', email: 'test@example.com',
    reason: 'first-exam', preferredDate: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd'),
    message: 'Test submission from GAS editor.', source: 'GAS Test',
  });
  console.log('testSubmitInquiry result:', JSON.stringify(result));
}

function testDailySummary() {
  const result = generateDailySummary();
  console.log('testDailySummary result:', JSON.stringify(result));
}

function testChat() {
  sendChatMessage('🧪 Test message — LL-OPTICALV2 GAS 009-B. Chat webhook is working.');
}

function testVLA() {
  const result = generateVLA({
    title: 'Test VLA Entry',
    observation: 'Test VLA generated from GAS editor.',
    insight: 'VLA system is working correctly.',
    connection: 'IMPLEMENTATION_009 E009-018.',
    futureRelevance: 'Will power VLA archive in docs/vla/.',
    skills: ['VLA generation', 'Drive file creation'],
    nextAction: 'Commit generated VLA to GitHub repo.',
  });
  console.log('testVLA result:', JSON.stringify(result));
}

function testHealth() {
  const result = getSystemHealth();
  console.log('testHealth result:', JSON.stringify(result));
}
