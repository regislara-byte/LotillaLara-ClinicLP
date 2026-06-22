# IMPLEMENTATION_004.md

## Project

LL-OPTICALV2

## Phase Title

Booking Communication Layer

## Framework

Applied Engineering AI + Human Intelligence

## Status

READY AFTER IMPLEMENTATION_003 IS STABLE

---

## Goal

Add the first real communication workflow for LL-OPTICALV2 without overbuilding.

The website should allow patients to contact or book through:

1. WhatsApp CTA
2. Gmail / mailto fallback
3. Google Chat-ready structure for future automation

---

## Core Rule

Do not break the current working visual design.

Implementation 004 should enhance communication only.

Keep EYLOTL™ as the visual companion, not the form handler yet.

---

## Required Features

### 1. WhatsApp CTA

Add or improve WhatsApp contact button.

Purpose:

* Fast patient inquiry
* Mobile-first communication
* Simple clinic contact flow

Expected behavior:

User clicks WhatsApp button
→ opens WhatsApp with pre-filled message

Sample message:

Hello Lotilla-Lara Optical Clinic, I would like to book an eye checkup.

---

### 2. Gmail / Mailto Booking Fallback

Keep booking form functional using mailto for now.

Expected fields:

* Full Name
* Phone Number
* Email
* Preferred Date
* Preferred Time
* Service Type
* Message

On submit:

Open user's email app with formatted booking request.

Do not connect backend yet.

---

### 3. Google Chat Preparation

Prepare clean structure for future Google Apps Script workflow.

Do not activate yet.

Future flow:

Booking form
→ Google Apps Script
→ Google Sheet
→ Google Chat notification
→ Clinic team receives alert

Add comments in code only where needed.

---

### 4. Form Validation

Add basic validation:

* Required name
* Required contact detail
* Required service
* Friendly error message
* Success message before mailto opens

Keep it simple.

---

### 5. Mobile Optimization

Ensure WhatsApp button and booking form are clean on mobile.

Buttons should be easy to tap.

No tiny fields.

No layout overflow.

---

## Do Not Implement Yet

Do not add:

* Real Google Apps Script endpoint
* Google Sheet connection
* Google Chat webhook
* Database
* Payment gateway
* Login system
* LL.mp4 injection
* EYLOTL animation

These belong to later implementations.

---

## Files To Update

* index.html
* style.css
* script.js
* README.md optional update

---

## Delivery Rule

After implementation is complete:

Render the FULL contents of:

1. index.html
2. style.css
3. script.js

FULL FILES ONLY.

Do not summarize.
Do not explain.
Do not truncate.
Do not use placeholders.
Do not stop after verification.

Final output must include complete production-ready code for all three files.

---

## Success Criteria

Implementation 004 is successful if:

* WhatsApp CTA works
* Booking form opens a formatted Gmail/mailto message
* Form validation works
* Mobile layout remains clean
* Current hero and EYLOTL™ branding remain untouched
* Google Chat workflow is prepared but not activated

---

## 🤖 AI Build Delivery Rule

For future Claude / AI implementation prompts:

After implementation is complete, render the FULL contents of:

1. index.html
2. style.css
3. script.js

FULL FILES ONLY.

Do not summarize.
Do not explain.
Do not truncate.
Do not use placeholders.
Do not stop after verification.

Final output must include complete production-ready code for all three files.

## Workflow

Edit
Save
Push
Observe
VLA
Improve

Status:

READY TO BUILD ✅
