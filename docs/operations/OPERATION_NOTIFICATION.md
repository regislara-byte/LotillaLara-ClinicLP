# OPERATION INJECTION

Name:
Notification Engine

Module:
LL-OPTICALV2 Operations

Status:
Planning

---

## Purpose

Provide real-time communication between the website, Google Apps Script, Google Sheets, clinic staff, and patients.

The Notification Engine serves as the communication layer of LL-OPTICALV2.

---

## Trigger Sources

✓ New Inquiry

✓ Appointment Request

✓ Appointment Confirmed

✓ Appointment Cancelled

✓ Follow-up Reminder

✓ Weekly Report

✓ Analytics Report

✓ System Error

✓ Admin Login

---

## Delivery Channels

Google Chat

Gmail

WhatsApp (Future)

SMS (Future)

Push Notification (Future)

---

## Notification Flow

Website

↓

Google Apps Script

↓

Google Sheets

↓

Notification Engine

↓

Google Chat

↓

Clinic Staff

↓

Patient

---

## Google Sheet

Notifications

Columns

NotificationID

Timestamp

Type

Recipient

Channel

Subject

Message

Status

ReferenceID

SentBy

---

## Dashboard Integration

Dashboard displays

Unread Notifications

Failed Notifications

Today's Notifications

Recent Activity

Notification History

---

## Analytics Integration

Track

Delivery Success

Response Time

Average Follow-up

Most Common Notification Type

Communication History

---

## Future Expansion

Patient Portal

Appointment Reminders

Birthday Greetings

Frame Ready Notification

Eye Check Reminder

Prescription Expiration Reminder

Newsletter

---

## Engineering Notes

This module remains isolated from Dashboard logic.

Dashboard only visualizes notification data.

Notification delivery is handled exclusively by Google Apps Script.

Single Responsibility Principle is maintained.