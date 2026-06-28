# DEPLOYMENT_GUIDE.md

# LL-OPTICALV2 Backend Deployment Guide

Implementation 009

---

# Overview

This guide transforms LL-OPTICALV2 from a static landing page into a complete operational platform.

After completing this guide the system will automatically:

- Store inquiries in Google Sheets
- Send Google Chat notifications
- Send Gmail confirmations
- Power the Admin Dashboard

Estimated Time

90 Minutes

Complete it in three short sprints.

---

# Sprint A — Foundation (30 Minutes)

## STEP 1

### Open Google Apps Script

Visit

```
https://script.google.com
```

Create

```
New Project
```

Rename the project

```
LL-OPTICALV2 Operations
```

---

## STEP 2

Delete

```
Code.gs
```

Paste

```
gas_0009.gs
```

Done.

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

Example

```
https://docs.google.com/spreadsheets/d/

1AbCdEFGhIjK...

/edit
```

Only copy

```
1AbCdEFGhIjK...
```

---

## STEP 4

Open

```
gas_0009.gs
```

Find

```javascript
SHEET_ID
```

Replace with

Your Sheet ID

---

# Sprint B — Backend Configuration (30 Minutes)

## STEP 5

Open Google Chat

Create

Incoming Webhook

Copy

Webhook URL

Open

```
gas_0009.gs
```

Replace

```javascript
CHAT_WEBHOOK
```

with

Your Webhook URL

---

## STEP 6

Run

```javascript
initializeSheets()
```

Google requests permission.

Accept.

Expected Result

✅ Eight worksheets created automatically.

---

## STEP 7

Run

```javascript
installTriggers()
```

Expected Result

Creates

- Daily Trigger
- Weekly Trigger
- Notification Trigger

---

## STEP 8

Deploy

Apps Script

↓

Deploy

↓

New Deployment

↓

Web App

↓

Access

```
Anyone
```

↓

Deploy

↓

Copy

```
EXEC URL
```

---

## STEP 9

Open

```
script.js
```

Find

```javascript
const GAS_ENDPOINT=""
```

Replace

```
EXEC URL
```

---

## STEP 10

Open

```
admin.html
```

Find

```javascript
const GAS_ENDPOINT=""
```

Replace

```
EXEC URL
```

---

# Sprint C — Validation (30 Minutes)

## STEP 11

Run

```javascript
testChat()
```

Expected Result

✅ Google Chat receives a message.

---

## STEP 12

Run

```javascript
testPatientEmail()
```

Expected Result

✅ Gmail confirmation email received.

---

## STEP 13

Submit the website inquiry form.

Expected Result

✅ Google Sheet updated

↓

✅ Google Chat notification received

↓

✅ Gmail confirmation sent

↓

✅ Admin Dashboard ready

↓

😊 Success!

---

# Definition of Done

The deployment is complete when all items below are successful.

- [ ] Google Apps Script Created
- [ ] Spreadsheet Connected
- [ ] Sheet ID Configured
- [ ] Chat Webhook Configured
- [ ] initializeSheets() Executed
- [ ] installTriggers() Executed
- [ ] Web App Deployed
- [ ] EXEC URL Connected
- [ ] Website Connected
- [ ] Google Sheet Updated
- [ ] Chat Notification Received
- [ ] Gmail Confirmation Received
- [ ] Admin Dashboard Operational

---

# Deliverables

Implementation 009 provides

```
Website

↓

Google Apps Script

↓

Google Sheets

↓

Google Chat

↓

Gmail

↓

Dashboard

↓

Operations Ready
```

---

# Next

Implementation 010

Dashboard Analytics

Purpose

Transform collected operational data into visual insights and reporting.

Implementation 009 collects the data.

Implementation 010 visualizes the data.

---

# Applied Engineering

This guide is intentionally written for both humans and AI.

No programming background is required.

Follow each step in sequence.

Build Once.

Publish Everywhere.