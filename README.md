# Hotspot Builder

A single-file, no-build-step tool for turning any image into an annotated, interactive experience — upload a picture, mark it up with hotspots, measurements, callouts, and highlight zones, and export the result as a standalone page, an embeddable snippet, a flat image, or a ready-to-paste prompt for Claude Code.

Everything runs entirely in the browser. There's no server, no dependencies, and no build process — `index.html` is the whole app.

## Features

Four annotation tools work together on the same image — pick one from the toolbar and click or drag on the canvas:

- **📍 Hotspots** — click to pin a numbered marker to a UI region, with a title, optional description, optional image/GIF or audio clip, and an optional B&H product link. Drag existing pins to reposition them. Great for documenting interaction areas and flagging issues.
- **📐 Measurements** — drag to draw a ruler-style line between two points. The distance label is computed from the source image's *natural* pixel dimensions (not the on-screen render size), so it stays accurate for spacing reviews and developer handoff regardless of zoom or display size. Tag it with a dimension (Height/Width/Depth chips) and an optional "With stand" checkbox — they compose into a label like "Width with stand" — or just type any free-text label instead.
- **✏️ Callouts** — drag to draw a labeled arrow pointing at something specific — fast markup without leaving the browser.
- **🖼 Highlights** (infographics) — drag to draw a rectangle or ellipse zone with adjustable color/opacity and an optional label, for layering visual callouts over screenshots in stakeholder presentations and async walkthroughs.

All four types coexist on one image, each with its own color (and, for highlights, shape/opacity) style controls, and are tracked together in a combined, grouped annotation list in the side panel.

- **Upload an image** by dragging it in or tapping to browse (JPEG, PNG, WebP, GIF).
- **Smart tooltips**: hotspot tooltips automatically reposition and flip so they never spill past the edges of the image.
- **Preview mode**: toggle to a read-only view with hover/tap-triggered hotspot tooltips and no editing.
- **Export options**:
  - **HTML file** — a self-contained standalone page with everything embedded.
  - **Embed code** — a drop-in snippet you can paste into any existing page.
  - **WebP image** — a flat image with every annotation drawn on, for docs or social sharing.
  - **Claude Code prompt** — your full annotation data, image, and build instructions, ready to paste into Claude Code to implement in any framework.

## Responsive design

The tool adapts to three distinct layouts:

- **Desktop** — full canvas + side panel, hover-based tooltips.
- **iPad / tablet** — keeps the sidebar layout (rather than collapsing to a phone UI), with touch-sized controls and tap-based tooltips.
- **Phone** — a compact layout with a bottom nav and slide-up sheets for the annotation list and style controls.

Touch devices (phone or tablet) get tap/drag-based creation and tap-to-preview interactions in place of hover, driven by Pointer Events so the same code handles mouse, touch, and pen.

## Usage

1. Open `index.html` in any modern browser (double-click it, or serve it with any static file server).
2. Upload a background image.
3. Pick a tool — **Hotspot**, **Measure**, **Callout**, or **Highlight** — from the toolbar.
4. Click (Hotspot) or click-and-drag (Measure/Callout/Highlight) on the image to place an annotation. Hotspots and Callouts prompt for a label; Measurements and Highlights get one automatically, with an optional note/label you can add.
5. Toggle **Preview** to see the finished hover/tap tooltips in a read-only view.
6. Click **Export** to grab a standalone HTML file, an embed snippet, a flat WebP image, or a Claude Code prompt — all four annotation types are included in every format.

## Tech notes

- Pure HTML/CSS/vanilla JavaScript — no frameworks, no build tooling, no external runtime dependencies.
- All uploaded images and media are embedded as base64 data URLs, so exported files are fully self-contained.
- Measurement/callout geometry renders via an SVG overlay sized to the image's actual rendered pixel dimensions (not raw percentages), redrawn on resize, so lines and arrowheads never distort on non-square images.
- Fonts (Syne, DM Sans) are loaded from Google Fonts; everything else works offline.
