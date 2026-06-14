# 👓 Lotilla-Lara Optical Clinic

## That Cares Your Eyes.

A modern optical clinic landing page designed to showcase eye care services, premium eyewear collections, and patient-friendly appointment booking.

Built as a lightweight GitHub Pages project with a focus on trust, simplicity, and visual storytelling.

---

## 🌟 Features

- Premium Eyewear Gallery
- Mobile-Friendly Layout
- Appointment Booking Section
- WhatsApp Contact Integration
- Clean Modern Optical Branding
- GitHub Pages Deployment

## 🚀 Implementation Roadmap

### IMPLEMENTATION_003 — Visual Experience Layer ✅

Status: Ready / Pushable

Focus:

* EYLOTL™ mascot-first hero direction
* Premium optical storytelling
* Gallery image structure
* Mobile-first visual polish
* Booking form using mailto fallback
* WhatsApp CTA
* YouTube / music experience section
* No Google Chat automation yet
* No LL.mp4 injection yet

Current rule:

**Not perfect. Pushable.**

---

### IMPLEMENTATION_004 — Booking Communication Layer 🔜

Status: Planned

Goal:

Add the first real communication workflow without overbuilding.

Communication channels:

1. WhatsApp CTA
2. Gmail / mailto booking fallback
3. Google Chat-ready structure for future automation

Expected booking flow for now:

Patient fills booking form
→ Form validates required fields
→ Gmail/mailto opens with formatted booking request
→ Patient sends email manually

Future automation flow:

Patient submits booking form
→ Google Apps Script
→ Google Sheet
→ Google Chat notification
→ Clinic receives alert

Implementation 004 must not activate Google Apps Script yet.

---

## 📩 Booking Communication Notes

### WhatsApp

WhatsApp should open with a pre-filled patient inquiry message.

Sample:

Hello Lotilla-Lara Optical Clinic, I would like to book an eye checkup.

### Gmail / Mailto

The booking form should open the user's email app with formatted details:

* Full Name
* Phone Number
* Email
* Preferred Date
* Preferred Time
* Service Type
* Message

### Google Chat

Google Chat integration is reserved for a later stable phase.

Do not connect backend automation until Implementation_003 is fully pushed and observed.

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

---

## 👩‍⚕️ Clinic Information

**Clinic Name:** Lotilla-Lara Optical Clinic

**Doctor:** Dra. Eldie L. Lara

**Schedule:** Sunday – Friday

**Email:** laraeldie1956@gmail.com

**WhatsApp:** +63 967 271 0883

---

## 🖼️ Featured Collections

### Premium Collection
- LL16 — Premium Eyeglasses
- LL17 — Designer Collection
- LL18 — Look Is Everything

### Specialty Collections
- LL19 — Pediatric Collection
- LL20 — Sports & Active Collection

Designed for:
- Everyday Wear
- Long Screen Hours
- Children's Vision Care
- Active Lifestyle Protection

---

## 🌐 Live Website

GitHub Pages:

https://regislara-byte.github.io/LotillaLara-ClinicLP/

---

## 📂 Project Structure

```text
LL-OPTICALV2/
│
├── assets/
│   ├── images/
│   │   ├── hero/
│   │   └── gallery/
│   │
│   ├── icons/
│   └── vids/
│
├── docs/
├── updates/
│
├── index.html
├── style.css
├── README.md
└── optical.push.bat

---

Future evolution tree:

EYLOTL™
The Vision Companion

├── Smarty EYLOTL™
│   The Knowledge Lens
│
├── Sporty EYLOTL™
│   Active Vision Guide
│
├── Kidlotl™
│   Pediatric Vision Buddy
│
├── Dr. EYLOTL™
│   Eye Care Assistant
│
├── Cyber EYLOTL™
│   Future Vision Series
│
└── Animated EYLOTL™
    Walk • Blink • Wave