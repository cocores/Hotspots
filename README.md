# Hotspot Builder

A single-file, no-build-step tool for turning any image into an interactive, clickable hotspot experience — upload a picture, drop numbered pins on it, attach a title/description/media/link to each one, and export the result as a standalone page, an embeddable snippet, a flat image, or a ready-to-paste prompt for Claude Code.

Everything runs entirely in the browser. There's no server, no dependencies, and no build process — `index.html` is the whole app.

## Features

- **Upload an image** by dragging it in or tapping to browse (JPEG, PNG, WebP, GIF).
- **Place hotspots** by clicking/tapping anywhere on the image. Drag existing pins to reposition them.
- **Per-hotspot content**: a title, an optional description, an optional image/GIF or audio clip, and an optional B&H product link.
- **Style controls**: pick a pin color (presets or a custom color picker), choose an animation (pulse, ripple, bounce, or none), and adjust the animation speed.
- **Smart tooltips**: hotspot tooltips automatically reposition and flip so they never spill past the edges of the image.
- **Live hotspot list**: a running total plus counts for hotspots with media, text, or links, and a full-detail card for every hotspot (thumbnail/audio/link included).
- **Export options**:
  - **HTML file** — a self-contained standalone page with everything embedded.
  - **Embed code** — a drop-in snippet you can paste into any existing page.
  - **WebP image** — a flat image with the pins drawn on, for docs or social sharing.
  - **Claude Code prompt** — your hotspot data, image, and build instructions, ready to paste into Claude Code to implement in any framework.

## Responsive design

The tool adapts to three distinct layouts:

- **Desktop** — full canvas + side panel, hover-based tooltips.
- **iPad / tablet** — keeps the sidebar layout (rather than collapsing to a phone UI), with touch-sized controls and tap-based tooltips.
- **Phone** — a compact layout with a bottom nav and slide-up sheets for the hotspot list and style controls.

Touch devices (phone or tablet) get tap-to-place, drag-to-reposition, and tap-to-preview interactions in place of hover.

## Usage

1. Open `index.html` in any modern browser (double-click it, or serve it with any static file server).
2. Upload a background image.
3. Make sure **+ Add Hotspot** mode is selected, then click/tap on the image to place a pin.
4. Fill in a title (required) and any optional description, media, or B&H product ID, then save.
5. Switch to **Preview** mode to see the finished hover/tap tooltips.
6. Click **Export** to grab a standalone HTML file, an embed snippet, a flat WebP image, or a Claude Code prompt.

## Tech notes

- Pure HTML/CSS/vanilla JavaScript — no frameworks, no build tooling, no external runtime dependencies.
- All uploaded images and media are embedded as base64 data URLs, so exported files are fully self-contained.
- Fonts (Syne, DM Sans) are loaded from Google Fonts; everything else works offline.
