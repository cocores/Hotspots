# Annotation Tool

A single-file, no-build-step tool for turning any image into an annotated, interactive experience — upload a picture, mark it up with hotspots, measurements, callouts, highlight zones, and title banners, and export the result as a standalone page, an embeddable snippet, a flat image, or a ready-to-paste prompt for Claude Code. A second mode turns two images into a draggable **before/after comparison slider**.

Everything runs entirely in the browser. There's no server, no dependencies, and no build process — `index.html` is the whole app.

## Features

Five annotation tools work together on the same image — pick one from the toolbar and click or drag on the canvas:

- **📍 Hotspots** — click to pin a numbered marker to a UI region, with a title, optional description, optional media, and an optional B&H product link. Drag existing pins to reposition them. Great for documenting interaction areas and flagging issues.
  - Media can be an **image/GIF**, an **audio** clip, or a **video** — either uploaded directly from your computer (embedded as base64, playable with native controls) or a **YouTube or Vimeo link** (auto-detected from any watch/share URL and embedded as a responsive player). Video plays right in the hotspot's tooltip, with a small expand button that opens it larger in a lightbox — closing the lightbox returns you to the normal hotspot view. Works the same way in the builder, preview, and every export format.
- **📐 Measurements** — drag to draw a ruler-style line between two points, rendered as a technical dimension line with a solid arrowhead pointing outward at *both* ends (not small tick marks). Hold **Shift** while dragging to constrain the line to a straight 45°-increment angle (horizontal, vertical, or diagonal) — handy for perfectly level or plumb reference lines. The distance label is computed from the source image's *natural* pixel dimensions (not the on-screen render size), so it stays accurate for spacing reviews and developer handoff regardless of zoom or display size. Tag it with a dimension (Height/Width/Depth chips) and any combination of **With stand**, **With lens** (cameras), and **With wheels** (bags/cases) checkboxes — they compose into a label like "Width with stand" or "Depth with stand, lens" — or just type any free-text label instead. There's also an optional, numbers-only **Value** field for entering the real-world measurement yourself (e.g. `24.5`), plus an **Inch/Centimeter/Feet** toggle — when set, the value and unit (e.g. "24.5 IN") are shown in place of the auto-computed pixel distance everywhere the measurement appears. Feet singularizes to "FOOT" when the value is exactly `1` (e.g. "1 FOOT" vs. "3 FEET"). On the image, each measurement renders as a rounded chip with a color-matched accent bar, the label in muted text, the value in bold, and the unit as a small colored badge — consistent across the builder, the standalone/embed exports, and the flat WebP render. A **Horizontal/Vertical** text-direction toggle controls the chip's orientation — Vertical rotates it 90° to read bottom-to-top alongside a vertical measurement line, while the ruler line itself never rotates. A **Solid/Dashed/Dotted** line style toggle (in the style panel as the default for new lines, and per-measurement in the add/edit modal) controls how the ruler line itself is drawn — the arrowheads at each end always stay solid. A **Show dimension summary card** checkbox in the Measurement style panel auto-builds a "PRODUCT DIMENSIONS" style summary card — a navy tab plus one icon+label+value cell per measurement that has a value and unit set — positioned at the bottom of the image, for a product-spec-sheet look (like an Amazon/e-commerce dimension infographic).
- **✏️ Callouts** — drag to draw a labeled arrow pointing at something specific — fast markup without leaving the browser.
- **🖼 Highlights** (infographics) — drag to draw a rectangle or ellipse zone with adjustable color/opacity and an optional label, for layering visual callouts over screenshots in stakeholder presentations and async walkthroughs.
- **Aa Title Banners** — click to place a headline text overlay (like a product name or feature title), with an optional subtitle shown below it wrapped in em dashes (e.g. "— Strong Support & Anti-Tip Design —"). Renders as a centered, near-full-width white card near the placement point, always on top of every other overlay.

All five types coexist on one image, each with its own color (and, for highlights, shape/opacity) style controls, and are tracked together in a combined, grouped annotation list in the side panel.

- **Upload an image** by dragging it in or tapping to browse (JPEG, PNG, WebP, GIF).
- **Smart tooltips**: hotspot tooltips automatically reposition and flip so they never spill past the edges of the image, and an open tooltip always stacks above every other hotspot pin, even ones placed nearby or overlapping it.
- **Header badge**: the header shows the currently selected tool (Hotspot/Measure/Callout/Highlight/Banner), updating live as you switch tools.
- **Zoom**: a draggable slider in the toolbar scales the display view down from 100% to 25% (in 25% steps), for a bird's-eye look at the full canvas. It's a display-only zoom — hotspots, measurements, callouts, highlights, and banners all place, drag, and draw correctly at any zoom level. Always starts at 100% on a fresh upload or reset.
- **Preview mode**: toggle to a read-only view with hover/tap-triggered hotspot tooltips and no editing. It's hard to miss — the header badge switches to a glowing, pulsing "Preview Mode" pill, the toolbar tints blue, and the canvas gets a blue ring around it, so you always know when you're looking at the read-only view versus editing.
- **Export options**:
  - **HTML file** — a self-contained standalone page with everything embedded.
  - **Minified HTML** — a heavily minified page kept under 3000 characters, for pasting into places with a strict size limit. Unlike the other exports, the image isn't embedded — it's referenced by an `IMAGE_URL` placeholder you replace with your own hosted link. Media, video, and some styling (callout arrowheads, measurement ticks/rotation) are dropped to hit the size target; hotspot tooltips use a native `<details>` element so opening one closes any other with no JavaScript needed for it. The export modal shows a live character count against the 3000 budget.
  - **Embed code** — a drop-in snippet you can paste into any existing page.
  - **Image** — a flat image with every annotation drawn on, for docs or social sharing. Pick the format: **WebP**, **JPEG**, **PNG**, or **GIF**. GIF is encoded by a small built-in GIF89a/LZW encoder (no external library) using a fixed 256-color palette, so it may show some color banding — use WebP or PNG for full-fidelity color.
  - **Claude Code prompt** — your full annotation data, image, and build instructions, ready to paste into Claude Code to implement in any framework.

## Before & After slider

A separate mode from the annotation tool, switched via the **Annotate / Before & After** pill in the header. Upload a **before** image and an **after** image (drag-and-drop or tap to browse, same validation as the main uploader) and get an interactive comparison slider: drag the handle (mouse, touch, or pen — Pointer Events again) to reveal more or less of the before image over the after image, with "BEFORE"/"AFTER" corner labels. Uses `clip-path` on the before image rather than resizing it, so nothing distorts as you drag. "Change before"/"Change after" swap either image without starting over; "Reset both" clears both. Exports as a **standalone HTML file**, an **embed snippet**, or a **minified HTML file** (own compact export modal, since there's no annotation data or flat-image concept here) — all three fully self-contained with the images embedded as base64 and the same drag behavior working in the exported page. Unlike the main tool's minified export, the before/after minified export keeps both images embedded (no `IMAGE_URL` placeholder) so it displays with zero hosting required — it hits this by writing every element with inline `style=""` attributes instead of a CSS class sheet. The 4000-character budget shown in the export modal covers only that markup/CSS/JS, not the embedded image data — base64 always inflates real photos to far more than 4000 characters on its own, so the two aren't comparable. For the minified export specifically, both images are also automatically downscaled (capped at 600px on the long edge) and re-compressed to JPEG in a background canvas pass before embedding, shrinking the base64 payload considerably (a modest ~32KB source photo dropped to ~13KB in testing) without needing to touch the full-quality standalone/embed exports.

## Responsive design

The tool adapts to three distinct layouts:

- **Desktop** — full canvas + side panel, hover-based tooltips.
- **iPad / tablet** — keeps the sidebar layout (rather than collapsing to a phone UI), with touch-sized controls and tap-based tooltips.
- **Phone** — a compact layout with a bottom nav and slide-up sheets for the annotation list and style controls.

Touch devices (phone or tablet) get tap/drag-based creation and tap-to-preview interactions in place of hover, driven by Pointer Events so the same code handles mouse, touch, and pen.

## Usage

1. Open `index.html` in any modern browser (double-click it, or serve it with any static file server).
2. Upload a background image.
3. Pick a tool — **Hotspot**, **Measure**, **Callout**, **Highlight**, or **Banner** — from the toolbar.
4. Click (Hotspot/Banner) or click-and-drag (Measure/Callout/Highlight) on the image to place an annotation. Hotspots and Callouts prompt for a label; Banners prompt for a headline (+ optional subtitle); Measurements and Highlights get one automatically, with an optional note/label you can add.
5. Toggle **Preview** to see the finished hover/tap tooltips in a read-only view.
6. Click **Export** to grab a standalone HTML file, a minified HTML snippet, an embed snippet, a flat WebP image, or a Claude Code prompt — all five annotation types are included in every format.

## Tech notes

- Pure HTML/CSS/vanilla JavaScript — no frameworks, no build tooling, no external runtime dependencies.
- All uploaded images and media are embedded as base64 data URLs, so exported files are fully self-contained.
- Measurement/callout geometry renders via an SVG overlay sized to the image's actual rendered pixel dimensions (not raw percentages), redrawn on resize, so lines and arrowheads never distort on non-square images.
- The canvas area is a fixed-height viewport that scrolls internally when an image is taller than the window — the toolbar (and side panel) never scroll away, and the image stays reachable edge-to-edge (not clipped at the near side, a common flexbox-centering pitfall).
- Fonts (Syne, DM Sans) are loaded from Google Fonts; everything else works offline.
- The two brand accent colors (`--accent` gold/amber, `--accent2` blue, both defined in `:root`) are a best-effort approximation of B&H Photo Video's public brand identity — the primary blue matches the existing "See Details" product-link button color already used in this app. `bhphotovideo.com/a/design-system` returned a 403 (bot-protection block) with no accessible cached copy, so these aren't verified against B&H's actual design-system spec; swap the two CSS variables if you have the real tokens.
