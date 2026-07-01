# EXECUTION.md

# BACKEND DEPARTMENT

## Implementation 009

---

# Mission

Transform LL-OPTICALV2 from a static website into an operational application using Google Apps Script.

This execution document is intentionally written for humans.

No coding knowledge is required.

Follow each checkpoint in order.

---

# Objective

Complete the entire backend deployment pipeline.

By the end of this execution:

✅ Website Inquiry

↓

✅ Google Sheet Database

↓

✅ Google Chat Notification

↓

✅ Gmail Confirmation

↓

✅ Dashboard Ready

---

# Estimated Time

Approximately

90 Minutes

Break into three sprints.

---

# Sprint A (30 Minutes)

## STEP 1

Open

https://script.google.com

Create

New Project

Rename

```
LL-OPTICALV2 Operations
```

---

## STEP 2

Delete

```
Code.gs
```

Default content

Replace with

```
gas_0009.gs
```

---

## STEP 3

Create Google Spreadsheet

Example

```
LL-OPTICALV2 Operations
```

Copy

```
Sheet ID
```

---

## STEP 4

Inside

```
gas_0009.gs
```

Replace

```
SHEET_ID
```

with

Your Sheet ID

---

## STEP 5

Create

Incoming Google Chat Webhook

Copy

Webhook URL

---

## STEP 6

Inside

```
gas_0009.gs
```

Replace

```
CHAT_WEBHOOK
```

with

Your Chat Webhook URL

---

## Sprint A Complete

Checklist

- [ ] Apps Script Created
- [ ] Spreadsheet Created
- [ ] Sheet ID Added
- [ ] Chat Webhook Added

---

# Sprint B (30 Minutes)

## STEP 7

Run

```
initializeSheets()
```

Google asks permission.

Accept.

Expected Result

Eight worksheets created automatically.

---

## STEP 8

Run

```
installTriggers()
```

Expected Result

Triggers created

- Daily
- Weekly
- Notifications

---

## STEP 9

Open

```
script.js
```

Replace

```
const GAS_ENDPOINT=""
```

Leave blank for now.

Deploy first.

---

## STEP 10

Open

```
admin.html
```

Replace

```
const GAS_ENDPOINT=""
```

Leave blank.

Deploy first.

---

## Sprint B Complete

Checklist

- [ ] initializeSheets()
- [ ] installTriggers()
- [ ] script.js Prepared
- [ ] admin.html Prepared

---

# Sprint C (30 Minutes)

## STEP 11

Deploy

Apps Script

Deploy

↓

New Deployment

↓

Web App

Access

```
Anyone
```

Copy

```
EXEC URL
```

---

## STEP 12

Paste

EXEC URL

Inside

```
script.js
```

and

```
admin.html
```

Replace

```
const GAS_ENDPOINT=""
```

Save.

---

## STEP 13

Run

```
testChat()
```

Expected Result

Google Chat receives notification.

---

## STEP 14

Run

```
testPatientEmail()
```

Expected Result

Gmail confirmation email arrives.

---

## STEP 15

Submit

Website inquiry form.

Expected Results

✅ Google Sheet Updated

✅ Google Chat Notification

✅ Gmail Confirmation

---

# Definition of Done

The backend is considered complete when all of the following are successful:

- [ ] Apps Script deployed
- [ ] Spreadsheet connected
- [ ] Chat Webhook active
- [ ] Triggers installed
- [ ] Web App deployed
- [ ] Website connected
- [ ] Inquiry saved
- [ ] Chat notification received
- [ ] Gmail confirmation received
- [ ] Admin dashboard connected

---

# Deliverables

At completion the project produces:

- Google Apps Script Backend
- Google Spreadsheet Database
- Google Chat Notification System
- Gmail Auto Confirmation
- Admin Dashboard
- Live Website Integration

---

# Next Implementation

Implementation_010

Dashboard

Purpose

Visualize operational data collected by Implementation_009.

Implementation_009 provides the data.

Implementation_010 transforms the data into insights.

---

# Applied Engineering Note

This document is an execution guide—not technical documentation.

Its purpose is to allow any collaborator, regardless of coding experience, to deploy the backend by following a repeatable sequence of actions.

Build Once.

Publish Everywhere.
