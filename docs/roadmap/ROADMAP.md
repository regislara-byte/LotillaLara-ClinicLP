# ROADMAP.md

# LL-OPTICALV2 Roadmap

Framework:
Applied Engineering AI + Human Intelligence

Status:
ACTIVE DEVELOPMENT

---

## Project Vision

LL-OPTICALV2 is evolving from a premium optical clinic landing page into a lightweight clinic experience platform.

The public website remains beautiful, fast, and patient-friendly.

The private system grows into an operations layer powered by Google Workspace.

---

## Core Architecture Philosophy

Keep the public landing page clean.

Maintain:

* index.html
* style.css
* script.js

Use external operational layers only when needed.

Avoid overloading the landing page with backend logic.

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
ACTIVE 🚧

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

# Phase 3 — Operations Layer

## IMPLEMENTATION_009

Operations Backend

Status:
DISPATCHED 🚧

Purpose:
Connect the landing page to Google Workspace operations.

Core Architecture:

Website form
↓
Google Apps Script endpoint
↓
Google Sheets
↓
Google Chat
↓
Google Docs report
↓
Daily archive

Deliverables:

* Replace mailto submission with fetch() to GAS endpoint
* Preserve fallback behavior
* Create gas_e009.gs
* Create Google Sheets structure
* Generate daily summaries
* Send Google Chat alerts
* Create Google Docs reports
* Archive reports
* Prepare hidden admin dashboard entry point

Important:
IMPLEMENTATION_009 is primarily backend/operations architecture, not frontend redesign.

---

# Phase 4 — Management Layer

## IMPLEMENTATION_010

Admin Dashboard

Status:
PLANNED 🔮

Purpose:
Create a private dashboard for clinic operations.

Possible Deliverables:

* admin.html
* inquiry overview
* appointment overview
* follow-up queue
* daily metrics
* service interest breakdown
* frame consultation tracking
* status filters

Rules:

* Admin dashboard stays hidden from public users.
* Patient data must not appear on the public LP.
* Use Google Sheets as source of truth.

---

# Phase 5 — Analytics Layer

## IMPLEMENTATION_011

Clinic Analytics

Status:
PLANNED 🔮

Purpose:
Convert clinic activity into decision-ready insights.

Possible Metrics:

* Daily inquiries
* Weekly inquiries
* Monthly inquiries
* Appointment conversion
* Most requested services
* Most viewed frame collections
* Follow-up completion rate
* Frame consultation demand
* Pediatric inquiry trend
* Sports/active frame trend

Possible Outputs:

* Weekly Google Docs report
* Monthly Google Sheets dashboard
* Google Chat summary

---

# Phase 6 — Automation Intelligence Layer

## IMPLEMENTATION_012

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

# Recommended Root Tree Direction

Future structure:

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
├── google-apps-script/
│   ├── gas_e009.gs
│   ├── daily_summary.gs
│   ├── chat_notifications.gs
│   └── docs_report_generator.gs
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

Finish:

IMPLEMENTATION_008B
Curated Frames Premium Showroom

Then continue:

IMPLEMENTATION_009
Operations Backend

---

## Current project state in my VSC would be

001-005 Foundation      ✅

006 Hero System         ✅

007 Motion System       ✅

008 Showroom System     🚧

009 Backend System      🚧

010 Dashboard           🔮

011 Analytics           🔮

012 Intelligence        🔮

---

# Roadmap Status

LOCKED AS PROJECT NORTH STAR ✅
