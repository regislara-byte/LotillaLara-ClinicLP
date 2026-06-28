# GOOGLE_APPS_SCRIPT.md

# Google Apps Script Deployment Guide

Project

LL-OPTICALV2

Version

009-C

---

## Purpose

This document explains how to deploy and maintain the Google Apps Script backend used by LL-OPTICALV2.

The backend connects the landing page with Google Workspace services, creating a lightweight business operations platform.

---

# Services Used

✓ Google Apps Script

✓ Google Sheets

✓ Gmail

✓ Google Chat

✓ Time-driven Triggers

✓ Web App Deployment

---

# Backend Workflow

Patient

↓

Landing Page

↓

Inquiry Form

↓

Google Apps Script

↓

Google Sheets

↓

Notifications

↓

Reports

↓

Dashboard

---

# Initial Setup

## Step 1

Create a new Apps Script project.

Name:

LL-OPTICALV2 Operations

---

## Step 2

Delete

```javascript
function myFunction() {

}
```

Paste

gas_e009.gs

---

## Step 3

Create Google Spreadsheet

Suggested Name

LL-OPTICALV2 Operations

---

## Step 4

Copy Spreadsheet ID

Paste into

CONFIG.SHEET_ID

---

## Step 5

Create Google Chat Incoming Webhook

Paste URL into

CONFIG.CHAT_WEBHOOK

---

# Initialize Backend

Run

initializeSheets()

Creates

✓ Inquiries

✓ Appointments

✓ Notifications

✓ Reports

✓ Analytics

✓ FollowUps

✓ AuditLog

✓ Settings

---

# Install Triggers

Run

installTriggers()

Creates

• Daily Trigger

• Weekly Trigger

• Follow-up Trigger

---

# Deploy

Deploy

↓

New Deployment

↓

Web App

↓

Anyone

↓

Copy EXEC URL

---

# Frontend Configuration

Paste EXEC URL into

script.js

const GAS_ENDPOINT

and

admin.html

const GAS_ENDPOINT

---

# Verification Checklist

Run

✓ testChat()

Receive Google Chat message

✓ testPatientEmail()

Receive Gmail message

✓ testSubmitInquiry()

Verify Google Sheet updates

✓ Submit website form

Verify end-to-end pipeline

---

# Maintenance

Whenever gas_e009.gs changes

1. Save

2. Deploy

3. Create New Version

4. Update Deployment

No frontend changes are required unless the endpoint changes.

---

# Engineering Philosophy

GitHub Pages serves the frontend.

Google Apps Script serves as the backend.

Google Sheets serves as the operational database.

Google Chat delivers internal notifications.

Gmail communicates with patients.

The result is a production-ready serverless clinic operations platform with minimal infrastructure and no dedicated backend server.

---

Status

Implementation_009

Production Ready
