## ML-006 — Curated Frame Atmosphere Layer

Status:
APPROVED FOR IMPLEMENTATION ✅

---

### Purpose

Transform the Curated Frames section from a static gallery into a living optical showroom experience.

The atmosphere layer exists behind the content and acts as a visual storytelling element.

Visitors should feel surrounded by eyewear before interacting with collections.

---

### Inspiration

Reference Direction:

* Floating Portrait Gallery
* 3D Parallax Wall
* Editorial Luxury Showrooms
* Apple Product Atmosphere
* Museum Exhibition Displays

Adaptation:

Replace portraits with:

* eyeglass frames
* optical silhouettes
* lens reflections
* premium eyewear imagery

---

### Background Layer

Create a dedicated atmosphere layer behind the Curated Frames section.

The layer should contain floating frame visuals sourced from:

* Ray-Ban Collection
* Designer Collection
* Look Is Everything
* Pediatric Collection
* Sports & Active

These visuals must remain secondary to the primary content.

---

### Motion System

Animation Style:

* slow drifting
* subtle parallax
* gentle depth movement
* infinite loop

Avoid:

* spinning
* flashing
* aggressive scaling
* gaming-style effects

Movement should feel calm, premium, and editorial.

---

### Performance Rules

* CSS-first implementation
* GPU-friendly transforms only
* translate3d preferred
* low CPU impact
* no heavy libraries
* maintain page performance

---

### Visibility Rules

Background opacity:

5%–12%

The atmosphere layer must never reduce readability.

All foreground content must remain dominant.

Priority order:

1. Headline
2. Collection Cards
3. CTA
4. Atmosphere Layer

---

### Reduced Motion

Respect:

prefers-reduced-motion

If enabled:

* disable drifting
* disable parallax
* keep static visual composition

---

### Mobile Rules

Desktop:

* full atmosphere effect
* layered depth

Tablet:

* reduced density

Mobile:

* simplified atmosphere
* fewer floating elements
* preserve performance

---

### Expected Result

Visitors should experience:

Optical Showroom
+
Luxury Editorial Design
+
Interactive Product Discovery

The Curated Frames section should feel alive even before a collection is opened.

---

### Internal Layer Name

ML-006
Curated Frame Atmosphere Layer

Status:
BUILD WITH IMPLEMENTATION_008 ✅
