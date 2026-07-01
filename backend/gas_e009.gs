/**
 * ================================================================
 * gas_e009.gs — LL-OPTICALV2 Operations Backend
 * IMPLEMENTATION_009 · Google Apps Script Web App
 * Version: 009-C (TASK_009_BACKEND complete)
 *
 * WHAT'S NEW IN 009-C
 * ─────────────────────────────────────────
 * + Notifications tab (Tab 8) — full engine log
 * + sendPatientEmail() — patient-facing Gmail templates
 * + notificationEngine() — unified dispatcher (Chat + Gmail)
 * + confirmAppointment() — doPost action, writes Appointments tab
 * + cancelAppointment()  — status update + notifications
 * + sendFollowUpReminder() — scheduled trigger, overdue queue sweep
 * + processFollowUpQueue() — daily 9AM sweep of pending follow-ups
 * + Gmail templates: Confirmation, Reminder, FrameReady, PrescriptionReady
 * + Settings: EMAIL_ENABLED, FOLLOWUP_REMINDER_DAYS added
 * + doPost() routes: submitInquiry, confirmAppointment, cancelAppointment
 * + testPatientEmail(), testNotificationEngine() added
 *
 * SHEET STRUCTURE (8 tabs)
 * ─────────────────────────────────────────
 * Tab 1: Inquiries      — all patient form submissions
 * Tab 2: Appointments   — confirmed appointment tracking
 * Tab 3: Notifications  — full notification engine log
 * Tab 4: Reports        — daily/weekly report archive
 * Tab 5: Analytics      — aggregated metric snapshots
 * Tab 6: FollowUps      — pending follow-up queue
 * Tab 7: AuditLog       — system event log
 * Tab 8: Settings       — clinic config key-value store
 *
 * DEPLOYMENT STEPS (do once)
 * ──────────────────────────
 * 1. Paste this file into script.google.com
 * 2. Update CONFIG.SHEET_ID with your Sheet ID
 * 3. Update CONFIG.CHAT_WEBHOOK with your Chat webhook URL
 * 4. Run initializeSheets() once — creates/syncs all 8 tabs
 * 5. Run installTriggers() once — daily 6PM + daily 9AM + weekly Monday
 * 6. Deploy → Web App → Anyone → copy /exec URL
 * 7. Paste /exec URL into:
 *       script.js  → const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzRD7Rprj6K3MLb6-i6YJivdu3JkqdsDTAFJcGUAOarrMoRozE0gplsWp2W0q06QvhMtw/exec'
 *       admin.html → const GAS_ENDPOINT = '...'
 * ================================================================
 */

/* ================================================================
   CONFIG
================================================================ */
const CONFIG = {
  SHEET_ID:      '1eUv-GRZPFR9LBhEND2sBA-3QrN-2uAD1wg4a8DTsrkc',
  CHAT_WEBHOOK:  '""',
  CHAT_ENABLED:   false,
  OWNER_EMAIL:   'laraeldie1956@gmail.com',
  CLINIC_NAME:   'Lotilla-Lara Optical Clinic',
  CLINIC_PHONE:  '+63 967 271 0883',
  CLINIC_HOURS:  'Sunday – Friday, 9:00 AM – 6:00 PM',
  TIMEZONE:      'Asia/Manila',
  EOD_HOUR:      18,
  MORNING_HOUR:  9,
  ADMIN_VERSION: '009',
};

/* ================================================================
   TAB NAMES — 8 tabs
================================================================ */
const TABS = {
  INQUIRIES:     'Inquiries',
  APPOINTMENTS:  'Appointments',
  NOTIFICATIONS: 'Notifications',
  REPORTS:       'Reports',
  ANALYTICS:     'Analytics',
  FOLLOWUPS:     'FollowUps',
  AUDIT_LOG:     'AuditLog',
  SETTINGS:      'Settings',
};

/* ================================================================
   doPost() — receives actions from LP and admin
   Body: { action, ...payload }
   Actions: submitInquiry | confirmAppointment | cancelAppointment
================================================================ */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      status: "LL-OPTICALV2 Backend e009 is running",
      method: "GET",
      version: CONFIG.ADMIN_VERSION,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action || 'submitInquiry';
    let result;

    switch (action) {
      case 'submitInquiry':
        result = submitInquiry(data);
        break;
      case 'confirmAppointment':
        result = confirmAppointment(data);
        break;
      case 'cancelAppointment':
        result = cancelAppointment(data);
        break;
      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }

    return jsonResponse(result);
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
      case 'getDashboard':          result = getDashboardData();             break;
      case 'generateDailySummary':  result = generateDailySummary();         break;
      case 'generateWeeklySummary': result = generateWeeklySummary();        break;
      case 'exportDailyReportPDF':  result = { url: exportDailyReportPDF() };break;
      case 'getHealth':             result = getSystemHealth();              break;
      case 'getAnalytics':          result = getAnalyticsData();             break;
      case 'getNotifications':      result = getNotificationLog();           break;
      default:                      result = { error: 'Unknown action.' };
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
    inquiryId,
    now.toISOString(),
    data.name        || '',
    data.phone       || '',
    data.email       || '',
    service,
    data.message     || '',
    data.source      || 'Website',
    'New',
    '',
  ]);

  // Notification engine — Chat + patient email if address provided
  notificationEngine({
    type:      'NEW_INQUIRY',
    inquiryId,
    name:      data.name,
    phone:     data.phone,
    email:     data.email,
    service,
    preferredDate: data.preferredDate,
    time:      Utilities.formatDate(now, CONFIG.TIMEZONE, 'HH:mm'),
  });

  // Analytics + audit
  recordAnalytic('inquiry_received', 1, service);
  auditLog('inquiry_submitted', data.name || 'unknown', `InquiryID: ${inquiryId}, Service: ${service}`);

  // Auto-create follow-up if date given
  if (data.preferredDate && data.preferredDate !== 'Not specified') {
    addFollowUp({ inquiryId, name: data.name, phone: data.phone,
                  reason: service, dueDate: data.preferredDate });
  }

  checkFirstInquiryVLA();

  return { success: true, inquiryId };
}

/* ================================================================
   E009-NEW — confirmAppointment()
   Writes to Appointments tab + notifies patient + staff
   Payload: { inquiryId, patientName, phone, email,
              date, time, service, notes }
================================================================ */
function confirmAppointment(data) {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const apptSht = ss.getSheetByName(TABS.APPOINTMENTS);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  if (!apptSht) throw new Error('Appointments tab not found. Run initializeSheets().');

  const now   = new Date();
  const apptId = 'APT-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmmss');

  apptSht.appendRow([
    apptId,
    data.inquiryId   || '',
    data.date        || '',
    data.time        || '',
    data.patientName || data.name || '',
    data.service     || '',
    'Confirmed',
    data.notes       || '',
    now.toISOString(),
  ]);

  // Update inquiry status to Scheduled
  if (data.inquiryId && inqSht) {
    updateInquiryStatus(inqSht, data.inquiryId, 'Scheduled');
  }

  // Update follow-up if exists
  updateFollowUpStatus(data.inquiryId, 'Scheduled');

  notificationEngine({
    type:        'APPOINTMENT_CONFIRMED',
    apptId,
    inquiryId:   data.inquiryId,
    name:        data.patientName || data.name,
    phone:       data.phone,
    email:       data.email,
    service:     data.service,
    date:        data.date,
    time:        data.time,
  });

  recordAnalytic('appointment_confirmed', 1, data.service || 'General');
  auditLog('appointment_confirmed', data.patientName || 'unknown',
           `ApptID: ${apptId}, Date: ${data.date} ${data.time}`);

  return { success: true, apptId };
}

/* ================================================================
   E009-NEW — cancelAppointment()
   Updates Appointments status + notifies
================================================================ */
function cancelAppointment(data) {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const apptSht = ss.getSheetByName(TABS.APPOINTMENTS);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  if (!apptSht) return { success: false, error: 'Appointments tab not found.' };

  // Find and update appointment row
  const rows = apptSht.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.apptId || rows[i][1] === data.inquiryId) {
      apptSht.getRange(i + 1, 7).setValue('Cancelled');
      break;
    }
  }

  if (data.inquiryId && inqSht) {
    updateInquiryStatus(inqSht, data.inquiryId, 'Cancelled');
  }

  notificationEngine({
    type:      'APPOINTMENT_CANCELLED',
    apptId:    data.apptId,
    inquiryId: data.inquiryId,
    name:      data.patientName || data.name,
    phone:     data.phone,
    email:     data.email,
    reason:    data.reason || 'Not specified',
  });

  recordAnalytic('appointment_cancelled', 1, 'Appointments');
  auditLog('appointment_cancelled', data.patientName || 'unknown',
           `ApptID: ${data.apptId}, Reason: ${data.reason || 'Not specified'}`);

  return { success: true };
}

/* ================================================================
   NOTIFICATION ENGINE — unified dispatcher
   E009-006 + OPERATION_NOTIFICATION.md

   Every notification flows through here.
   Decides: Chat? Patient email? Owner email? Log it.

   Logs every dispatch to Notifications tab.
================================================================ */
function notificationEngine(payload) {
  const { type } = payload;

  switch (type) {

    case 'NEW_INQUIRY':
      // Staff: Google Chat
      sendChatAlert(payload);
      // Patient: confirmation email if email provided
      if (payload.email) {
        sendPatientEmail(payload.email, 'INQUIRY_RECEIVED', payload);
      }
      break;

    case 'APPOINTMENT_CONFIRMED':
      // Staff: Google Chat
      sendChatMessage(
        `✅ *Appointment Confirmed — ${payload.apptId || ''}*\n` +
        `*Patient:* ${payload.name || 'Unknown'}\n` +
        `*Service:* ${payload.service || 'Not specified'}\n` +
        `*Date:* ${payload.date || ''} at ${payload.time || ''}\n` +
        `_${CONFIG.CLINIC_NAME}_`
      );
      // Patient: confirmation email
      if (payload.email) {
        sendPatientEmail(payload.email, 'APPOINTMENT_CONFIRMED', payload);
      }
      break;

    case 'APPOINTMENT_CANCELLED':
      sendChatMessage(
        `❌ *Appointment Cancelled — ${payload.apptId || ''}*\n` +
        `*Patient:* ${payload.name || 'Unknown'}\n` +
        `*Reason:* ${payload.reason || 'Not specified'}\n` +
        `_${CONFIG.CLINIC_NAME}_`
      );
      if (payload.email) {
        sendPatientEmail(payload.email, 'APPOINTMENT_CANCELLED', payload);
      }
      break;

    case 'FOLLOWUP_REMINDER':
      // Staff only — patient contact is manual
      sendChatMessage(
        `⏰ *Follow-Up Reminder*\n` +
        `*Patient:* ${payload.name || 'Unknown'} · ${payload.phone || ''}\n` +
        `*Service:* ${payload.reason || ''}\n` +
        `*Due:* ${payload.dueDate || ''}\n` +
        `*InquiryID:* ${payload.inquiryId || ''}\n` +
        `_${CONFIG.CLINIC_NAME} · Follow-Up Queue_`
      );
      break;

    case 'FRAME_READY':
      sendChatMessage(
        `👓 *Frames Ready — ${payload.name || 'Patient'}*\n` +
        `*Order:* ${payload.orderId || ''}\n` +
        `_${CONFIG.CLINIC_NAME}_`
      );
      if (payload.email) {
        sendPatientEmail(payload.email, 'FRAME_READY', payload);
      }
      break;

    case 'PRESCRIPTION_READY':
      sendChatMessage(
        `📋 *Prescription Ready — ${payload.name || 'Patient'}*\n` +
        `_${CONFIG.CLINIC_NAME}_`
      );
      if (payload.email) {
        sendPatientEmail(payload.email, 'PRESCRIPTION_READY', payload);
      }
      break;

    case 'WEEKLY_REPORT':
      sendChatMessage(payload.message || '📊 Weekly report generated.');
      sendOwnerEmail(payload.subject, payload.body);
      break;

    case 'SYSTEM_ALERT':
      sendChatMessage(`🚨 *System Alert*\n${payload.message}`);
      auditLog('system_alert', 'system', payload.message);
      break;

    case 'ADMIN_LOGIN':
      auditLog('admin_login', payload.user || 'admin', `Session started`);
      break;
  }

  // Log every dispatch to Notifications tab
  logNotification(type, payload);
  recordAnalytic('notification_sent', 1, type);
}

/* ================================================================
   E009-004 — Google Chat
================================================================ */
function sendChatAlert(payload) {
  if (!CONFIG.CHAT_ENABLED || !CONFIG.CHAT_WEBHOOK) return false;
  return sendChatMessage(formatChatMessage(payload));
}

function sendChatMessage(text) {
  if (!CONFIG.CHAT_ENABLED || !CONFIG.CHAT_WEBHOOK) return false;

  UrlFetchApp.fetch(CONFIG.CHAT_WEBHOOK, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: text })
  });

  return true;
}

/* ================================================================
   E009-NEW — Gmail Patient Templates
   sendPatientEmail(toEmail, templateType, data)

   Templates:
   INQUIRY_RECEIVED      — auto-reply when form submitted
   APPOINTMENT_CONFIRMED — date/time/service confirmation
   APPOINTMENT_CANCELLED — cancellation notice
   FOLLOWUP_REMINDER     — (future, opt-in only)
   FRAME_READY           — frames are in, come pick up
   PRESCRIPTION_READY    — prescription is ready
================================================================ */
function sendPatientEmail(toEmail, templateType, data) {
  if (!toEmail || !toEmail.includes('@')) return;

  const emailEnabled = getSettingValue('EMAIL_ENABLED');
  if (emailEnabled === 'FALSE' || emailEnabled === 'false') return;

  let subject, body;

  switch (templateType) {

    case 'INQUIRY_RECEIVED':
      subject = `We received your inquiry — ${CONFIG.CLINIC_NAME}`;
      body =
`Dear ${data.name || 'Patient'},

Thank you for reaching out to ${CONFIG.CLINIC_NAME}.

We have received your inquiry and will contact you shortly to confirm your appointment.

─────────────────────────────
Your Inquiry Details
─────────────────────────────
Service:        ${data.service || 'Not specified'}
Preferred Date: ${data.preferredDate || 'To be confirmed'}
Reference:      ${data.inquiryId || ''}
─────────────────────────────

We aim to respond within 24 hours.

If you need to reach us immediately:
📞 ${CONFIG.CLINIC_PHONE}
Hours: ${CONFIG.CLINIC_HOURS}

Warm regards,
Dr. Eldie L. Lara, O.D.
${CONFIG.CLINIC_NAME}

─────────────────────────────
This is an automated message. Please do not reply to this email.
To contact us directly: ${CONFIG.OWNER_EMAIL}`;
      break;

    case 'APPOINTMENT_CONFIRMED':
      subject = `Appointment Confirmed — ${data.date || ''} · ${CONFIG.CLINIC_NAME}`;
      body =
`Dear ${data.name || 'Patient'},

Your appointment has been confirmed.

─────────────────────────────
Appointment Details
─────────────────────────────
Date:     ${data.date || 'To be advised'}
Time:     ${data.time || 'To be advised'}
Service:  ${data.service || 'Not specified'}
Ref:      ${data.apptId || data.inquiryId || ''}
─────────────────────────────

What to bring:
• Previous prescriptions (if any)
• PhilHealth card or insurance information (if applicable)
• Any existing glasses or contact lenses for reference

Clinic Information:
📞 ${CONFIG.CLINIC_PHONE}
Hours: ${CONFIG.CLINIC_HOURS}

If you need to reschedule, please contact us at least 24 hours in advance.

We look forward to seeing you.

Warm regards,
Dr. Eldie L. Lara, O.D.
${CONFIG.CLINIC_NAME}

─────────────────────────────
This is an automated message. Contact us at: ${CONFIG.OWNER_EMAIL}`;
      break;

    case 'APPOINTMENT_CANCELLED':
      subject = `Appointment Cancellation — ${CONFIG.CLINIC_NAME}`;
      body =
`Dear ${data.name || 'Patient'},

Your appointment has been cancelled as requested.

─────────────────────────────
Cancelled Appointment
─────────────────────────────
Reference: ${data.apptId || data.inquiryId || ''}
Reason:    ${data.reason || 'Not specified'}
─────────────────────────────

To book a new appointment, please visit our website or contact us:
📞 ${CONFIG.CLINIC_PHONE}

We hope to see you soon.

Warm regards,
Dr. Eldie L. Lara, O.D.
${CONFIG.CLINIC_NAME}`;
      break;

    case 'FRAME_READY':
      subject = `Your frames are ready — ${CONFIG.CLINIC_NAME}`;
      body =
`Dear ${data.name || 'Patient'},

Great news — your frames are ready for pickup!

─────────────────────────────
Pickup Information
─────────────────────────────
Order Reference: ${data.orderId || data.inquiryId || ''}
Clinic Hours:    ${CONFIG.CLINIC_HOURS}
Contact:         ${CONFIG.CLINIC_PHONE}
─────────────────────────────

Please bring this email or your reference number when you visit.

We look forward to seeing you.

Warm regards,
Dr. Eldie L. Lara, O.D.
${CONFIG.CLINIC_NAME}`;
      break;

    case 'PRESCRIPTION_READY':
      subject = `Your prescription is ready — ${CONFIG.CLINIC_NAME}`;
      body =
`Dear ${data.name || 'Patient'},

Your prescription is ready.

You can pick it up during our clinic hours:
${CONFIG.CLINIC_HOURS}

Contact: ${CONFIG.CLINIC_PHONE}
Reference: ${data.inquiryId || ''}

Warm regards,
Dr. Eldie L. Lara, O.D.
${CONFIG.CLINIC_NAME}`;
      break;

    default:
      return; // Unknown template — do not send
  }

  try {
    MailApp.sendEmail({
      to:      toEmail,
      subject,
      body,
      name:    CONFIG.CLINIC_NAME,
      replyTo: CONFIG.OWNER_EMAIL,
    });
    recordAnalytic('patient_email_sent', 1, templateType);
    auditLog('patient_email_sent', toEmail, `Template: ${templateType}`);
  } catch (err) {
    auditLog('sendPatientEmail:ERROR', toEmail, `${templateType}: ${err.message}`);
  }
}

/* ================================================================
   Notifications Tab Logger
   Columns: NotificationID | Timestamp | Type | Recipient |
            Channel | Subject | Status | ReferenceID
================================================================ */
function logNotification(type, payload) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.NOTIFICATIONS);
    if (!sheet) return;

    const now = new Date();
    const id  = 'NOT-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmmss');

    // Determine channels used
    const channels = [];
    const chatEnabled = getSettingValue('CHAT_ENABLED') !== 'FALSE';
    if (chatEnabled) channels.push('Chat');
    if (payload.email) channels.push('Email');

    sheet.appendRow([
      id,
      now.toISOString(),
      type,
      payload.name    || payload.email || 'system',
      channels.join(', ') || 'Chat',
      type.replace(/_/g, ' '),
      'Sent',
      payload.inquiryId || payload.apptId || '',
    ]);
  } catch (err) {
    console.log('logNotification error (non-critical):', err.message);
  }
}

function getNotificationLog() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.NOTIFICATIONS);
  if (!sheet) return { notifications: [] };

  const rows = sheet.getDataRange().getValues().slice(1);
  const notifications = rows.slice(-50).reverse().map(r => ({
    notificationId: r[0],
    timestamp:      r[1],
    type:           r[2],
    recipient:      r[3],
    channel:        r[4],
    subject:        r[5],
    status:         r[6],
    referenceId:    r[7],
  }));

  return { notifications, generatedAt: new Date().toISOString() };
}

/* ================================================================
   E009-NEW — Follow-Up Reminder Engine
   processFollowUpQueue() — runs daily at 9AM via trigger
   Sweeps FollowUps tab for overdue or due-today items
================================================================ */
function processFollowUpQueue() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const fuSheet = ss.getSheetByName(TABS.FOLLOWUPS);
  if (!fuSheet) return;

  const today    = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const rows     = fuSheet.getDataRange().getValues();
  let   reminded = 0;

  const reminderDays = parseInt(getSettingValue('FOLLOWUP_REMINDER_DAYS') || '0', 10);

  for (let i = 1; i < rows.length; i++) {
    const row     = rows[i];
    const status  = String(row[4] || '').toLowerCase();
    const dueDate = row[6] ? String(row[6]).substring(0, 10) : '';

    // Only process Pending or Overdue rows
    if (['completed', 'cancelled', 'scheduled'].includes(status)) continue;
    if (!dueDate) continue;

    const due    = new Date(dueDate);
    const now    = new Date(today);
    const diffMs = now - due;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Due today or overdue
    if (diffDays >= 0) {
      const isOverdue = diffDays > 0;

      notificationEngine({
        type:      'FOLLOWUP_REMINDER',
        name:      row[2],
        phone:     row[3],
        reason:    row[7],
        dueDate,
        inquiryId: row[1],
        overdue:   isOverdue,
        daysPast:  diffDays,
      });

      // Mark as Reminded in Status
      fuSheet.getRange(i + 1, 5).setValue(isOverdue ? 'Overdue' : 'Reminded');
      reminded++;
    }
  }

  auditLog('followup_queue_processed', 'trigger', `Reminders sent: ${reminded}, Date: ${today}`);
  recordAnalytic('followup_reminders_sent', reminded, 'FollowUps');

  return { success: true, reminded, date: today };
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
    followUpId,
    data.inquiryId || '',
    data.name      || '',
    data.phone     || '',
    'Pending',
    '',
    data.dueDate   || '',
    data.reason    || '',
  ]);
}

function updateFollowUpStatus(inquiryId, newStatus) {
  if (!inquiryId) return;
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.FOLLOWUPS);
    if (!sheet) return;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === inquiryId) {
        sheet.getRange(i + 1, 5).setValue(newStatus);
      }
    }
  } catch (err) {
    console.log('updateFollowUpStatus error:', err.message);
  }
}

/* ================================================================
   E009-002 — getDashboardData()
================================================================ */
function getDashboardData() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const fuSht   = ss.getSheetByName(TABS.FOLLOWUPS);
  const repSht  = ss.getSheetByName(TABS.REPORTS);
  const audSht  = ss.getSheetByName(TABS.AUDIT_LOG);
  const notSht  = ss.getSheetByName(TABS.NOTIFICATIONS);

  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');

  const inqRows  = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const todayInq = inqRows.filter(r => r[1] && String(r[1]).startsWith(today));

  const inquiries = [...todayInq].reverse().slice(0, 25).map(r => ({
    inquiryId:  r[0], timestamp: r[1], name: r[2],
    phone:      r[3], email:     r[4], service:   r[5],
    message:    r[6], source:    r[7], status:    r[8] || 'New',
    assignedTo: r[9],
  }));

  const kpis = buildKPIs(todayInq, inqRows);

  const fuRows = fuSht ? fuSht.getDataRange().getValues().slice(1) : [];
  const followups = fuRows
    .filter(r => !['Completed','Cancelled'].includes(r[4]))
    .sort((a, b) => new Date(a[6]) - new Date(b[6]))
    .slice(0, 15)
    .map(r => ({
      followUpId: r[0], inquiryId: r[1], name:       r[2],
      phone:      r[3], status:    r[4], assignedTo: r[5],
      dueDate:    r[6], notes:     r[7],
    }));

  const repRows = repSht ? repSht.getDataRange().getValues().slice(1) : [];
  const recentReports = repRows.slice(-7).reverse().map(r => ({
    reportId: r[0], date: r[1], type: r[2],
    inquiries: r[3], appointments: r[4], notes: r[5], generatedAt: r[6],
  }));

  const audRows = audSht ? audSht.getDataRange().getValues().slice(1) : [];
  const auditEntries = audRows.slice(-10).reverse().map(r => ({
    logId: r[0], timestamp: r[1], action: r[2],
    user: r[3], details: r[4], notes: r[5],
  }));

  // Today's notifications
  const notRows = notSht ? notSht.getDataRange().getValues().slice(1) : [];
  const todayNotifications = notRows
    .filter(r => r[1] && String(r[1]).startsWith(today))
    .slice(-10).reverse()
    .map(r => ({
      notificationId: r[0], timestamp: r[1], type: r[2],
      recipient: r[3], channel: r[4], status: r[6],
    }));

  const health = getSystemHealth();

  return {
    kpis, inquiries, followups,
    recentReports, auditEntries,
    todayNotifications,
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
    totalInquiries:   todayRows.length,
    confirmed:        statuses.filter(s => ['scheduled','completed'].includes(s)).length,
    pendingFollowups: statuses.filter(s => ['new','contacted'].includes(s)).length,
    cancelled:        statuses.filter(s => s === 'cancelled').length,
    frameConsults:    todayRows.filter(r => String(r[5]).toLowerCase().includes('frame')).length,
    pediatric:        todayRows.filter(r => String(r[5]).toLowerCase().includes('pediatric')).length,
    sports:           todayRows.filter(r => String(r[5]).toLowerCase().includes('sport')).length,
    weeklyInquiries:  weekRows.length,
    weeklyConfirmed:  weekRows.filter(r =>
      ['scheduled','completed'].includes(String(r[8]||'').toLowerCase())).length,
  };
}

/* ================================================================
   E009-003 — generateDailySummary()
================================================================ */
function generateDailySummary() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const repSht  = ss.getSheetByName(TABS.REPORTS);

  const today    = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const allRows  = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const todayInq = allRows.filter(r => r[1] && String(r[1]).startsWith(today));
  const kpis     = buildKPIs(todayInq, allRows);

  const docTitle = `${CONFIG.CLINIC_NAME} — Daily Report ${today}`;
  const doc      = DocumentApp.create(docTitle);
  const body     = doc.getBody();

  appendDocHeader(body, 'Daily Operations Report', today);

  body.appendParagraph('INQUIRY SUMMARY').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  [
    ['Total Inquiries',       kpis.totalInquiries],
    ['Confirmed / Scheduled', kpis.confirmed],
    ['Pending Follow-Ups',    kpis.pendingFollowups],
    ['Frame Consultations',   kpis.frameConsults],
    ['Pediatric Inquiries',   kpis.pediatric],
    ['Cancelled',             kpis.cancelled],
  ].forEach(([l, v]) => body.appendParagraph(`${l}: ${v}`));
  body.appendHorizontalRule();

  body.appendParagraph('SERVICE BREAKDOWN').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  const serviceCounts = {};
  todayInq.forEach(r => {
    const s = String(r[5] || 'Other');
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });
  Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])
    .forEach(([s, n]) => body.appendParagraph(`${s}: ${n}`));
  body.appendHorizontalRule();

  if (todayInq.length) {
    body.appendParagraph('INQUIRY LOG').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    const tbl = body.appendTable();
    const hdr = tbl.appendTableRow();
    ['InquiryID','Time','Name','Service','Status'].forEach(h => hdr.appendTableCell(h));
    todayInq.forEach(r => {
      const row  = tbl.appendTableRow();
      const time = r[1] ? Utilities.formatDate(new Date(r[1]), CONFIG.TIMEZONE, 'HH:mm') : '';
      [String(r[0]||''), time, String(r[2]||''), String(r[5]||''), String(r[8]||'New')]
        .forEach(v => row.appendTableCell(v));
    });
  }

  body.appendHorizontalRule();
  body.appendParagraph(`Report generated by EYLOTL™ Reporting System · ${CONFIG.CLINIC_NAME}`);
  doc.saveAndClose();
  const docUrl  = doc.getUrl();
  const reportId = 'RPT-' + today + '-DAILY';

  if (repSht) {
    repSht.appendRow([reportId, today, 'Daily',
      kpis.totalInquiries, kpis.confirmed, docUrl, new Date().toISOString()]);
  }

  generateMarkdownReport('daily', today, kpis, serviceCounts);
  recordAnalytic('daily_report_generated', 1, 'Reports');

  sendOwnerEmail(
    `${CONFIG.CLINIC_NAME} — Daily Report ${today}`,
    buildEmailBody(today, kpis, docUrl)
  );

  notificationEngine({
    type:    'WEEKLY_REPORT',
    subject: `Daily Report — ${today}`,
    body:    buildEmailBody(today, kpis, docUrl),
    message:
      `📋 *Daily Report — ${today}*\n` +
      `Inquiries: ${kpis.totalInquiries} | Confirmed: ${kpis.confirmed} | Pending: ${kpis.pendingFollowups}\n` +
      `Frame Consults: ${kpis.frameConsults} | Pediatric: ${kpis.pediatric}\n` +
      `📄 ${docUrl}`,
  });

  auditLog('daily_report_generated', 'system', `ReportID: ${reportId}, Doc: ${docUrl}`);

  return { success: true, reportId, docUrl, message: `Daily report: ${docUrl}` };
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

  const weekEnd   = Utilities.formatDate(now,     CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const weekStart = Utilities.formatDate(weekAgo, CONFIG.TIMEZONE, 'yyyy-MM-dd');

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
    ['Total Inquiries',       kpis.totalInquiries],
    ['Confirmed / Scheduled', kpis.confirmed],
    ['Frame Consultations',   kpis.frameConsults],
    ['Pediatric Inquiries',   kpis.pediatric],
    ['Sports & Active',       kpis.sports],
    ['Cancelled',             kpis.cancelled],
    ['Weekly Confirmed',      kpis.weeklyConfirmed],
  ].forEach(([l, v]) => body.appendParagraph(`${l}: ${v}`));
  body.appendHorizontalRule();

  body.appendParagraph('SERVICE DEMAND').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])
    .forEach(([s, n]) => body.appendParagraph(`${s}: ${n}`));

  doc.saveAndClose();
  const docUrl  = doc.getUrl();
  const reportId = `RPT-${weekEnd}-WEEKLY`;

  if (repSht) {
    repSht.appendRow([reportId, weekEnd, 'Weekly',
      kpis.totalInquiries, kpis.confirmed, docUrl, new Date().toISOString()]);
  }

  generateMarkdownReport('weekly', weekEnd, kpis, serviceCounts, weekStart);
  recordAnalytic('weekly_report_generated', 1, 'Reports');

  notificationEngine({
    type:    'WEEKLY_REPORT',
    subject: `Weekly Report — ${weekStart} to ${weekEnd}`,
    body:    `Weekly total: ${kpis.totalInquiries} inquiries | Confirmed: ${kpis.confirmed}\nDoc: ${docUrl}`,
    message:
      `📊 *Weekly Report — ${weekStart} to ${weekEnd}*\n` +
      `Total: ${kpis.totalInquiries} inquiries | Confirmed: ${kpis.confirmed}\n` +
      `📄 ${docUrl}`,
  });

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
   E009-020 — System Health
================================================================ */
function getSystemHealth() {
  const ss     = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const audSht = ss.getSheetByName(TABS.AUDIT_LOG);
  const repSht = ss.getSheetByName(TABS.REPORTS);
  const anaSht = ss.getSheetByName(TABS.ANALYTICS);
  const notSht = ss.getSheetByName(TABS.NOTIFICATIONS);

  const audRows    = audSht ? audSht.getDataRange().getValues().slice(1) : [];
  const repRows    = repSht ? repSht.getDataRange().getValues().slice(1) : [];
  const errors     = audRows.filter(r => String(r[2]).includes('ERROR')).length;
  const total      = audRows.length;
  const successRate = total > 0 ? Math.round(((total - errors) / total) * 100) : 100;
  const lastReport = repRows.length ? repRows[repRows.length - 1][6] : null;

  const anaRows    = anaSht ? anaSht.getDataRange().getValues().slice(1) : [];
  const today      = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const todayAna   = anaRows.filter(r => r[1] && String(r[1]).startsWith(today));

  const notRows    = notSht ? notSht.getDataRange().getValues().slice(1) : [];
  const todayNot   = notRows.filter(r => r[1] && String(r[1]).startsWith(today));

  return {
    successRate,
    totalAuditEvents:       total,
    errorCount:             errors,
    reportsGenerated:       sumMetric(todayAna, 'daily_report_generated') +
                            sumMetric(todayAna, 'weekly_report_generated'),
    chatAlertsSent:         sumMetric(todayAna, 'notification_sent'),
    patientEmailsSent:      sumMetric(todayAna, 'patient_email_sent'),
    followupRemindersSent:  sumMetric(todayAna, 'followup_reminders_sent'),
    pdfsExported:           sumMetric(todayAna, 'pdf_exported'),
    notificationsToday:     todayNot.length,
    lastReportAt:           lastReport,
    lastSyncAt:             new Date().toISOString(),
    version:                CONFIG.ADMIN_VERSION,
  };
}

function sumMetric(rows, metric) {
  return rows.filter(r => r[2] === metric).reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
}

/* ================================================================
   Analytics Recording
================================================================ */
function recordAnalytic(metric, value, category, notes) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.ANALYTICS);
    if (!sheet) return;
    const now = new Date();
    const id  = 'ANA-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMddHHmmss');
    sheet.appendRow([id, Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd'),
                     metric, value, category || '', notes || '']);
  } catch (err) {
    console.log('recordAnalytic error (non-critical):', err.message);
  }
}

function getAnalyticsData() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(TABS.ANALYTICS);
  if (!sheet) return { rows: [] };

  const rows   = sheet.getDataRange().getValues().slice(1);
  const last30 = rows.slice(-200);
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
   Inquiry status helper
================================================================ */
function updateInquiryStatus(sheet, inquiryId, newStatus) {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === inquiryId) {
      sheet.getRange(i + 1, 9).setValue(newStatus);
      return;
    }
  }
}

/* ================================================================
   E009-018 — VLA Generation
================================================================ */
function generateVLA(data) {
  const { title, phase = '009', observation, insight,
          connection, futureRelevance, skills = [], nextAction } = data;

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

  const file = DriveApp.createFile(index + '.md', content, MimeType.PLAIN_TEXT);
  auditLog('vla_generated', 'system', `${index}: ${title}`);
  recordAnalytic('vla_generated', 1, 'Documentation');
  return { vlaId: index, url: file.getUrl() };
}

function checkFirstInquiryVLA() {
  const ss      = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const inqSht  = ss.getSheetByName(TABS.INQUIRIES);
  const today   = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const rows    = inqSht ? inqSht.getDataRange().getValues().slice(1) : [];
  const todayInq = rows.filter(r => r[1] && String(r[1]).startsWith(today));
  if (todayInq.length === 1) {
    generateVLA({
      title:          'First Patient Inquiry Received — ' + today,
      observation:    `First inquiry of ${today} via website. Service: ${todayInq[0][5] || 'Unknown'}.`,
      insight:        'Website-to-GAS pipeline functioning. Data captured, Chat alert sent, follow-up queued.',
      connection:     'Validates IMPLEMENTATION_009 E009-001 (inquiry capture) and E009-004 (Chat notification).',
      futureRelevance:'First-inquiry timestamps reveal weekly/monthly clinic rhythm for IMPLEMENTATION_011.',
      skills:         ['GAS doPost() endpoint', 'Sheets append', 'Chat webhook', 'FollowUp queue'],
      nextAction:     'Review in Sheets. Confirm Chat alert. Update status after follow-up.',
    });
  }
}

/* ================================================================
   E009-019 — GitHub Markdown Report
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

> **Privacy Note:** Aggregated metrics only. No patient names or personal information.

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
    const files = DriveApp.getFilesByName(filename);
    if (files.hasNext()) { files.next().setContent(content); }
    else { DriveApp.createFile(filename, content, MimeType.PLAIN_TEXT); }
    recordAnalytic('markdown_report_generated', 1, 'GitHub');
  } catch (err) {
    auditLog('generateMarkdownReport:ERROR', 'system', err.message);
  }
}

/* ================================================================
   AuditLog
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
   Settings helper
================================================================ */
function getSettingValue(key) {
  try {
    const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = ss.getSheetByName(TABS.SETTINGS);
    if (!sheet) return null;
    const rows = sheet.getDataRange().getValues().slice(1);
    const row  = rows.find(r => r[0] === key);
    return row ? String(row[1]) : null;
  } catch (err) { return null; }
}

/* ================================================================
   Doc helpers
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
    `Total Inquiries:       ${kpis.totalInquiries}\n` +
    `Confirmed/Scheduled:   ${kpis.confirmed}\n` +
    `Pending Follow-Ups:    ${kpis.pendingFollowups}\n` +
    `Frame Consultations:   ${kpis.frameConsults}\n` +
    `Pediatric Inquiries:   ${kpis.pediatric}\n` +
    `Sports & Active:       ${kpis.sports}\n` +
    `Cancelled:             ${kpis.cancelled}\n\n` +
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
  generateDailySummary();
  archiveOldInquiries();
  auditLog('eod_automation_ran', 'trigger', `Hour: ${CONFIG.EOD_HOUR}`);
}

function morningAutomation() {
  processFollowUpQueue();
  auditLog('morning_automation_ran', 'trigger', 'Follow-up queue processed');
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
   Run ONCE — creates/updates all 8 tabs
================================================================ */
function initializeSheets() {
  const ss    = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const TEAL  = '#0B5394';
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
      name: TABS.NOTIFICATIONS,
      headers: ['NotificationID','Timestamp','Type','Recipient',
                'Channel','Subject','Status','ReferenceID'],
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
    sheet.autoResizeColumns(1, def.headers.length);
  });

  // Pre-fill Settings
  const settingsSht = ss.getSheetByName(TABS.SETTINGS);
  if (settingsSht.getLastRow() < 2) {
    const now = new Date().toISOString();
    const rows = [
      ['CLINIC_NAME',           CONFIG.CLINIC_NAME,  'Clinic display name',                   now, ''],
      ['REPORT_TIME',           '18:00',             'Daily Report Time',                     now, ''],
      ['WEEKLY_REPORT',         'Monday',            'Weekly Report Day',                     now, ''],
      ['CHAT_ENABLED',          'TRUE',              'Enable Google Chat Notifications',       now, ''],
      ['EMAIL_ENABLED',         'TRUE',              'Enable Patient Gmail Notifications',     now, ''],
      ['FOLLOWUP_REMINDER_DAYS','0',                 'Days before due date to send reminder',  now, ''],
      ['ADMIN_VERSION',         CONFIG.ADMIN_VERSION,'Current Backend Version',               now, ''],
    ];
    settingsSht.getRange(2, 1, rows.length, 5).setValues(rows);
  }

  const default1 = ss.getSheetByName('Sheet1');
  if (default1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(default1); } catch (e) {}
  }

  auditLog('initializeSheets', 'admin', 'All 8 tabs created/verified. Version: ' + CONFIG.ADMIN_VERSION);
  console.log('initializeSheets() complete — 8 tabs ready.');
}

/* ================================================================
   SETUP — installTriggers()
   3 triggers: 6PM daily EOD + 9AM daily morning + Monday weekly
================================================================ */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // End of day — 6PM
  ScriptApp.newTrigger('endOfDayAutomation')
    .timeBased().everyDays(1).atHour(CONFIG.EOD_HOUR)
    .inTimezone(CONFIG.TIMEZONE).create();

  // Morning — 9AM — follow-up queue sweep
  ScriptApp.newTrigger('morningAutomation')
    .timeBased().everyDays(1).atHour(CONFIG.MORNING_HOUR)
    .inTimezone(CONFIG.TIMEZONE).create();

  // Weekly — Monday 8AM
  ScriptApp.newTrigger('generateWeeklySummary')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8).inTimezone(CONFIG.TIMEZONE).create();

  console.log('Triggers installed: EOD 6PM · Morning 9AM · Weekly Monday 8AM');
  auditLog('installTriggers', 'admin', '3 triggers installed.');
}

/* ================================================================
   TEST FUNCTIONS
================================================================ */
function testSubmitInquiry() {
  const result = submitInquiry({
    name: 'Test Patient', phone: '+63 9XX XXX XXXX',
    email: 'test@example.com', reason: 'first-exam',
    preferredDate: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd'),
    message: 'Test submission from GAS editor.', source: 'GAS Test',
  });
  console.log('testSubmitInquiry:', JSON.stringify(result));
}

function testConfirmAppointment() {
  const result = confirmAppointment({
    inquiryId:   'INQ-TEST-0001',
    patientName: 'Test Patient',
    phone:       '+63 9XX XXX XXXX',
    email:       'test@example.com',
    date:        Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd'),
    time:        '10:00 AM',
    service:     'First Eye Examination',
    notes:       'Test confirmation',
  });
  console.log('testConfirmAppointment:', JSON.stringify(result));
}

function testPatientEmail() {
  // Uses the owner email so you see it directly — change to a test address if preferred
  sendPatientEmail(CONFIG.OWNER_EMAIL, 'APPOINTMENT_CONFIRMED', {
    name:      'Test Patient',
    service:   'First Eye Examination',
    date:      Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd'),
    time:      '10:00 AM',
    apptId:    'APT-TEST-001',
    inquiryId: 'INQ-TEST-001',
  });
  console.log('testPatientEmail: sent to', CONFIG.OWNER_EMAIL);
}

function testNotificationEngine() {
  notificationEngine({
    type:         'NEW_INQUIRY',
    inquiryId:    'INQ-TEST-ENGINE',
    name:         'Engine Test',
    phone:        '+63 9XX XXX XXXX',
    email:        CONFIG.OWNER_EMAIL,
    service:      'First Eye Examination',
    preferredDate: 'Tomorrow',
    time:         '12:00',
  });
  console.log('testNotificationEngine: complete — check Chat + email + Notifications tab');
}

function testFollowUpQueue() {
  const result = processFollowUpQueue();
  console.log('testFollowUpQueue:', JSON.stringify(result));
}

function testDailySummary() {
  const result = generateDailySummary();
  console.log('testDailySummary:', JSON.stringify(result));
}

function testChat() {
  sendChatMessage('🧪 Test — LL-OPTICALV2 GAS 009-C. Notification Engine operational.');
}

function testHealth() {
  const result = getSystemHealth();
  console.log('testHealth:', JSON.stringify(result));
}

function testVLA() {
  const result = generateVLA({
    title:          'Test VLA Entry',
    observation:    'Test VLA generated from GAS editor — 009-C.',
    insight:        'VLA system operational. Notification Engine + Gmail templates confirmed.',
    connection:     'IMPLEMENTATION_009 E009-018.',
    futureRelevance:'Powers VLA archive in docs/vla/ for IMPLEMENTATION_012.',
    skills:         ['Notification Engine', 'Gmail templates', 'Follow-up queue', 'VLA generation'],
    nextAction:     'Commit generated VLA to GitHub.',
  });
  console.log('testVLA:', JSON.stringify(result));
}
