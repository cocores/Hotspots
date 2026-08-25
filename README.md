# Hotspots

- **`index.html`** — the original browser-based Hotspot Builder: upload an
  image, drop numbered hotspots on it, style them, and export as an HTML
  file, embed snippet, WebP image, or a Claude Code prompt. Everything
  lives in the tab until you export it; open the file directly, no build
  step.
- **`ios/`** — a native SwiftUI port with a real backend: projects (image +
  hotspots) save to Firebase (Firestore + Storage) under an anonymous
  per-device identity, so they persist and sync instead of living only in
  memory. See **[`ios/README.md`](ios/README.md)** for setup — it walks
  through registering a Firebase app, generating the Xcode project with
  XcodeGen, and what's still on you before an App Store submission.
- **`firebase.json`, `firestore.rules`, `firestore.indexes.json`,
  `storage.rules`** — the Firebase project config backing the iOS app.
