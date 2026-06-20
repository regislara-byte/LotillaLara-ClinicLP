## Claude Code Architecture Lock

Keep `index.html` clean.

Do not hardcode all 50 collection images manually.

Add only:

- `data-collection` attributes on the existing frame cards
- one reusable modal/carousel container before `</body>`

Use `script.js` to generate the 10 images dynamically per selected collection.

Use `style.css` for:

- glass button effects
- modal layout
- carousel animation
- atmosphere layer
- responsive behavior

Goal:

Powerful feature.
Clean HTML.
Maintainable architecture.

Important:

If a collection has 10 images, define them in JavaScript data, not directly in HTML.

Do not duplicate markup for each collection.

Build one reusable system.