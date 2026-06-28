# ROADMAP.md

# LL-OPTICALV2 Roadmap

## AI + Human Intelligence

### Build Once. Publish Everywhere.

Status:
ACTIVE DEVELOPMENT

---

## Roadmap Evolution

![LL-OPTICALV2 Roadmap Evolution](./roadmap/LL_OPTICALV2_ROADMAP_EVOLUTION.png)

```text
e009
Backend Foundation ✅

↓

e010
Operations Dashboard 🚧

↓

e011
Reports & Excel Export 🔮

↓

e012
Calendar + Daily Schedule 🔮

↓

e013
Automation Intelligence 🔮

↓

e014
AI Clinic Assistant 🔮
```

---

## Project Vision

LL-OPTICALV2 is evolving from a premium optical clinic landing page into a lightweight clinic operations platform.

The public website remains beautiful, fast, and patient-friendly.

The private system grows into an operations layer powered by Google Workspace, Google Apps Script, Google Sheets, Gmail, and future automation intelligence.

This project is no longer only a landing page.

It is becoming a reusable clinic system.

---

## Core Architecture Philosophy

Keep the public landing page clean.

Maintain:

* index.html
* style.css
* script.js

Use external operational layers only when needed.

Avoid overloading the landing page with backend logic.

Backend logic belongs in:

* Google Apps Script
* Google Sheets
* admin.html
* backend documentation
* operations documentation

---

# Phase 1 — Foundation Layer

## IMPLEMENTATION_001

Foundation Architecture

Status:
COMPLETE ✅

Purpose:
Establish the base landing page structure.

---

## IMPLEMENTATION_002

UX/UI Audit & LP Factory Alignment

Status:
COMPLETE ✅

Purpose:
Align the site with Apple clarity, NVIDIA visual hierarchy, Nike storytelling, Figma component logic, and Grażyna documentary flow.

---

## IMPLEMENTATION_003

Story & Experience Layer

Status:
COMPLETE ✅

Purpose:
Strengthen clinic story, services, and patient-centered content.

---

## IMPLEMENTATION_004

Booking & Contact Layer

Status:
COMPLETE ✅

Purpose:
Improve patient contact flow through booking form, WhatsApp, phone, and location access.

---

## IMPLEMENTATION_005

Patient Journey & Character System Foundation

Status:
COMPLETE ✅

Purpose:
Introduce EYLOTL™ and define the character ecosystem foundation.

---

# Phase 2 — Experience Layer

## IMPLEMENTATION_006

Hero Architecture System

Status:
COMPLETE ✅

Purpose:
Lock EYLOTL™ hero behavior across desktop, mobile, and zoom levels.

Deliverables:

* Full-bleed hero
* Responsive EYLOTL™ positioning
* Cache-busted CSS
* Mobile landscape validation
* Hero guide alignment

---

## IMPLEMENTATION_007

EYLOTL™ Motion System

Status:
COMPLETE ✅

Purpose:
Add subtle brand motion while preserving trust and performance.

Deliverables:

* Idle bob
* Eye blink
* Hover tilt
* Scroll parallax
* Frame highlight motion
* Reduced-motion guard

---

## IMPLEMENTATION_008

Curated Frames Showroom System

Status:
COMPLETE ✅

Purpose:
Transform Curated Frames into an interactive optical showroom.

Deliverables:

* Dynamic collection modal
* 5 collections × 10 images
* Glass controls
* Infinite carousel
* Collection identity layer
* Atmosphere layer
* Mobile-friendly modal
* Accessibility and keyboard support

---

# Phase 3 — Backend Foundation Layer

## IMPLEMENTATION_009

Backend Foundation

Status:
COMPLETE ✅

Purpose:
Connect the landing page to Google Workspace operations.

Core Architecture:

```text
Website Form
↓
Google Apps Script Web App
↓
Google Sheets Operations Database
↓
Gmail Notification Workflow
↓
Scheduled Triggers
↓
Operations Documentation
```

Completed Deliverables:

* GAS endpoint deployed
* Sheet ID initialized
* Google Sheets operations structure connected
* Appointment request email working
* Gmail conversation workflow tested
* doPost() live
* doGet() health check added
* Triggers installed:
  * EOD 6PM
  * Morning 9AM
  * Weekly Monday 8AM
* Backend evidence screenshot added
* Backend documentation pushed to GitHub

Important Discovery:

Google Chat Incoming Webhooks are restricted for personal Gmail accounts.

Decision:

Use Gmail notification workflow for e009.

Google Chat remains reserved for future Workspace or Chat App implementation.

---

# Phase 4 — Operations Dashboard Layer

## IMPLEMENTATION_010

Operations Dashboard

Status:
ACTIVE 🚧

Purpose:
Create a private dashboard for clinic operations.

Target Deliverables:

* admin.html
* Access code screen
* Inquiry overview
* Appointment overview
* Follow-up queue
* Notification log
* Audit log panel
* System health KPI cards
* Auto-refresh with countdown
* Toast notifications
* Inline confirm / cancel actions
* Dashboard wired to GAS e009 endpoint

Rules:

* Admin dashboard stays hidden from public users.
* Patient data must not appear on the public LP.
* Google Sheets remains the source of truth.
* GAS endpoint remains the backend bridge.

---

# Phase 5 — Reports & Export Layer

## IMPLEMENTATION_011

Reports & Excel Export

Status:
PLANNED 🔮

Purpose:
Transform appointment and inquiry data into printable and shareable operations files.

Possible Deliverables:

* Monthly appointment report
* Weekly appointment report
* Daily appointment summary
* Export to Excel / XLSX
* Export to CSV
* Printable clinic schedule
* Appointment status breakdown
* Patient booking archive
* Service demand report

Example Output:

```text
LL_Clinic_Appointments_June_2026.xlsx
```

Use Cases:

* Doctor schedule review
* Monthly operations archive
* Front desk printout
* Follow-up tracking
* Manual backup outside Google Sheets

---

# Phase 6 — Calendar & Daily Schedule Layer

## IMPLEMENTATION_012

Calendar + Daily Schedule

Status:
PLANNED 🔮

Purpose:
Convert appointment data into calendar-friendly operations.

Possible Deliverables:

* Daily appointment email
* Weekly schedule email
* Calendar-style appointment view
* Google Calendar event creation
* Appointment reminders
* Morning clinic schedule
* End-of-day appointment summary
* Confirmed / pending / cancelled separation

Example Flow:

```text
Appointments Tab
↓
Morning Trigger
↓
Generate Today's Schedule
↓
Email Doctor
↓
Optional Google Calendar Sync
```

---

# Phase 7 — Automation Intelligence Layer

## IMPLEMENTATION_013

Automation Intelligence

Status:
PLANNED 🔮

Purpose:
Add smart automation on top of operations data.

Possible Features:

* Daily EYLOTL™ summary
* Weekly clinic performance note
* Follow-up reminders
* Missed inquiry alerts
* Unconfirmed appointment alerts
* High-interest service alerts
* Frame category demand alerts
* Service demand insight
* Appointment conversion insight

Character Mapping:

EYLOTL™:
Daily report presenter

BOOKLOTL™:
Booking and appointment workflow

OPTILOTL™:
Frame consultation and sales workflow

VISILOTL™:
Eye exam and care notes

KIDLOTL™:
Pediatric visit category

---

# Phase 8 — AI Clinic Assistant Layer

## IMPLEMENTATION_014

AI Clinic Assistant

Status:
PLANNED 🔮

Purpose:
Introduce an AI-assisted clinic operations layer without replacing human decision-making.

Possible Features:

* AI-written daily summaries
* AI appointment insights
* AI follow-up suggestions
* AI service trend notes
* AI patient inquiry categorization
* AI report drafting
* AI admin assistant prompt library

Important Rule:

AI assists.

The clinic decides.

---

# Current System State

```text
001 Foundation              ✅
002 UX/UI Alignment         ✅
003 Story Layer             ✅
004 Booking Layer           ✅
005 Character Foundation    ✅
006 Hero System             ✅
007 Motion System           ✅
008 Showroom System         ✅
009 Backend Foundation      ✅
010 Operations Dashboard    🚧
011 Reports & Excel Export  🔮
012 Calendar + Daily Schedule 🔮
013 Automation Intelligence 🔮
014 AI Clinic Assistant     🔮
```

---

# Recommended Root Tree Direction

```text
LL-OPTICALV2/
│
├── index.html
├── style.css
├── script.js
├── README.md
├── ROADMAP.md
├── optical.push.bat
│
├── admin/
│   └── admin.html
│
├── backend/
│   ├── gas_e009.gs
│   ├── gas_e009_integrated.gs
│   ├── GOOGLE_APPS_SCRIPT.md
│   ├── TASK_009_BACKEND.md
│   ├── gas_engine.md
│   ├── execution.md
│   ├── steps.md
│   └── web_LONG_LIVE_BACKEND_FAFO_mode.png
│
├── operations/
│   ├── OPERATION_ANALYTICS.md
│   ├── OPERATION_AUDITLOG.md
│   ├── OPERATION_FOLLOWUPS.md
│   ├── OPERATION_NOTIFICATION.md
│   ├── OPERATION_REPORTS.md
│   └── OPERATION_SETTINGS.md
│
├── roadmap/
│   ├── ROADMAP.md
│   └── LL_OPTICALV2_ROADMAP_EVOLUTION.png
│
├── docs/
│   ├── implementations/
│   ├── vla/
│   ├── operations/
│   └── architecture/
│
├── assets/
│   ├── images/
│   ├── videos/
│   ├── mp3/
│   └── icons/
│
└── visualoreartifacts/
```

---

# Documentation Strategy

Every implementation should include:

* Purpose
* Scope
* Files touched
* Protected sections
* Architecture notes
* VLA observation
* Success criteria
* Status
* Evidence screenshot when available

---

# Protected Public LP Sections

Avoid accidental changes to:

* Hero
* EYLOTL™ identity
* Journey
* Booking
* Location
* WhatsApp
* Curated Frames
* Existing motion system

Only modify protected sections when the implementation explicitly requires it.

---

# Current Focus

Continue:

IMPLEMENTATION_010
Operations Dashboard

Then:

IMPLEMENTATION_011
Reports & Excel Export

---

# Roadmap Status

LOCKED AS PROJECT NORTH STAR ✅

Updated after:

IMPLEMENTATION_009 Backend Foundation success.
