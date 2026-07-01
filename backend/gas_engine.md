# GAS_ENGINE.md

# Google Apps Script Engine

Project

LL-OPTICALV2

Version

009-C

---

## Purpose

The Google Apps Script (GAS) Engine is the backend operations layer for LL-OPTICALV2.

It provides a serverless architecture using Google Workspace services instead of traditional backend infrastructure.

The objective is to deliver a production-ready business operations system without maintaining servers or paid backend APIs.

---

## Technology Stack

Frontend

• GitHub Pages
• HTML
• CSS
• JavaScript

Backend

• Google Apps Script

Database

• Google Sheets

Messaging

• Google Chat
• Gmail

Deployment

• Google Workspace
• Web App Deployment

---

## Responsibilities

The GAS Engine manages:

• Patient inquiries
• Appointment tracking
• Google Chat notifications
• Gmail notifications
• Follow-up scheduling
• Analytics
• Reports
• Audit logging
• Clinic settings

---

## Google Sheet Structure

1. Inquiries

Incoming website forms.

2. Appointments

Confirmed bookings.

3. Notifications

System notification history.

4. Reports

Daily and weekly summaries.

5. Analytics

Operational metrics.

6. FollowUps

Pending patient reminders.

7. AuditLog

System events.

8. Settings

Configuration values.

---

## Request Flow

Visitor

↓

Landing Page

↓

JavaScript

↓

Google Apps Script

↓

Google Sheets

↓

Notifications

↓

Google Chat

↓

Gmail

↓

Dashboard

---

## Deployment Workflow

1. Create Google Apps Script Project
2. Paste gas_e009.gs
3. Configure Sheet ID
4. Configure Google Chat Webhook
5. Run initializeSheets()
6. Run installTriggers()
7. Deploy Web App
8. Copy EXEC URL
9. Update script.js
10. Update admin.html
11. Test Chat
12. Test Gmail
13. Test Website Form

---

## Design Philosophy

No traditional backend server.

No VPS.

No database server.

No monthly infrastructure costs.

Instead, the system leverages the Google Workspace ecosystem to provide a lightweight, maintainable, and scalable backend suitable for small businesses.

---

## Engineering Principles

Build Once.

Publish Everywhere.

Applied Engineering

AI + Human Intelligence.

---

## Status

Implementation_009

Backend Operations Engine

Production Ready
