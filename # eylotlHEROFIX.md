# HERO BLANK SPACE FIX — SURGICAL PATCH

Project:
LL-OPTICALV2

Goal:
Fix the hero section blank/gray side spaces while preserving the current text exactly.

Problem:
At desktop view and zoomed-out views, the EYLOTL hero image is centered inside a constrained visual area, leaving large blank gray spaces around the hero composition.

Do not change:
- Hero text
- Heading
- CTA buttons
- Navigation
- EYLOTL character identity
- Image file
- Journey section
- Any other section

Fix only:
- Hero layout sizing
- Hero image coverage
- Hero background composition
- Container width/height behavior

Requirements:
- Hero should visually fill the viewport width better.
- Reduce large blank gray side spaces.
- Keep EYLOTL full body visible.
- Do not crop hands, feet, glasses, or thumbs up.
- Preserve left text readability.
- Keep the current dark overlay.
- Text must stay unchanged.

Preferred CSS direction:
- Allow `.hero-bg` to cover full viewport.
- Let `.hero-img` use full available hero width.
- Use `object-fit: cover` only if EYLOTL remains fully visible.
- Otherwise use `object-fit: contain` with a background color/gradient that blends with the image.
- Avoid creating a boxed hero image look.
- The hero should feel full-bleed, not like an image pasted inside a gray canvas.

Success Criteria:
At 100%, 75%, 50%, and 25% browser zoom:
- No awkward large blank gray side spaces.
- EYLOTL remains the visual anchor.
- Text remains readable and unchanged.
- Full character remains visible.
- Hero feels premium and intentional.

Status:
BUILD NOW ✅