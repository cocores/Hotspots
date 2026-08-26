# Hotspots (web SPA)

A React + Vite + TypeScript port of `index.html`'s Hotspot Builder, split
into a proper componentized app and wired to the same Firebase backend as
`../ios` — projects (image + hotspots) save to Firestore/Storage under an
anonymous per-browser identity instead of living only in the tab until
exported.

This was built and verified end-to-end in this environment (`npm run
build`, plus a real run against the Firestore/Storage/Auth emulator driven
with Playwright — create project, place/drag/edit/delete a hotspot, style
it, save, reload, delete project) — unlike `../ios`, there's a real
Node/npm toolchain here, so this one's actually been exercised, not just
written blind.

## What's different from `index.html`

- **Cloud-backed projects, not export.** Same reasoning as the iOS app:
  everything lives in Firestore/Storage under your browser's anonymous
  identity, not just in memory until you export a file. No HTML/embed/WebP
  export in this pass — say the word if you want it back.
- **"Link" instead of a B&H product ID**, same simplification made on iOS.
- **Componentized**, not a single 1000-line HTML file — see Structure
  below.
- **Firestore Security Rules gate writes** to the project's owning
  `request.auth.uid` (`../firestore.rules`, `../storage.rules`) — shared
  with the iOS app. Note anonymous identities are per-browser/per-device,
  so a project created on web won't show up on an iOS install (or a
  different browser) unless you're intentionally testing with the same
  Firebase project and treat that as a known limitation of "no real
  accounts."

## Structure

```
src/
├── main.tsx / App.tsx        entry point, auth gate, list ⇄ editor switch
├── theme.css                  shared tokens/buttons/modal/form styles
│                               (ported from index.html's :root variables)
├── types.ts                    Hotspot/HotspotProject/HotspotStyle — must
│                               match ios/Hotspots/Models field-for-field
├── firebase.ts                  Firebase app/auth/Firestore/Storage init,
│                                including Firestore/Auth/Storage emulator
│                                wiring for local dev without a real project
├── hooks/
│   ├── useAuth.ts               anonymous sign-in, tracks the uid
│   └── useProjects.ts           real-time Firestore subscription
├── lib/
│   └── projectsApi.ts           create/save/delete project, hotspot media
│                                upload — mirrors ios/Services/ProjectStore
└── components/
    ├── ProjectListView          project grid, create-new, delete
    ├── EditorView                 per-project screen: mode, save, panels
    ├── EditorCanvas                image + pins, pointer-based
    │                              tap-to-place / drag-to-move
    ├── HotspotPin / HotspotTooltip  animated pin, preview-mode tooltip
    ├── HotspotFormModal             add/edit sheet incl. media upload
    ├── HotspotListPanel              hotspot list + stats
    └── StylePanel                    color/animation/speed picker
```

## Develop

```bash
npm install
npm run dev
```

Without Firebase configured, the app shows a setup message instead of a
blank/broken screen (see `App.tsx`).

### Test against the Firestore emulator (no real Firebase project needed)

From the **repo root**:

```bash
npx firebase-tools emulators:start --project demo-hotspots --only auth,firestore,storage
```

Then in `web/.env.local`:

```
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
```

`firebase.ts` detects that var and points Auth/Firestore/Storage at the
emulator automatically, using placeholder config values — you don't need
real Firebase credentials to develop locally.

### Point at a real Firebase project

1. Reuse the same project as `../ios`, or create one — see
   [`../ios/README.md`](../ios/README.md) steps 2–3 (register a **Web**
   app instead of iOS in step 2; the Firestore/Storage/rules/Anonymous-auth
   steps are identical and shared).
2. Copy `.env.example` to `.env.local` and fill in the six
   `VITE_FIREBASE_*` values from the Firebase console.
3. Deploy the security rules from the repo root (skip if already done for
   the iOS app — same rules, same project):
   ```bash
   npx firebase-tools deploy --project YOUR_PROJECT_ID --only firestore:rules,firestore:indexes,storage
   ```

## Build / preview

```bash
npm run build
npm run preview
```

## Deploy on Vercel

`../vercel.json` (repo root) points a Vercel project at this subfolder:

```json
{
  "installCommand": "npm install --prefix web",
  "buildCommand": "npm run build --prefix web",
  "outputDirectory": "web/dist"
}
```

1. **Import the repo into Vercel** (New Project → this GitHub repo). Because
   of `vercel.json`, Vercel builds `web/` even though the repo root also
   has the standalone `index.html` tool — no per-project "Root Directory"
   setting needed.
2. **Project Settings → Environment Variables** — add the six
   `VITE_FIREBASE_*` values (Production, and Preview/Development if you
   want those environments live too), then redeploy. Vite bakes env vars
   in at build time, so a deploy that predates adding them will still show
   the "Firebase isn't configured" screen — you have to redeploy after.
   These are meant to be public (they ship in the built JS bundle) —
   Firestore/Storage Security Rules are what actually protect the data,
   not secrecy of these values.
3. Make sure the security rules are deployed to that Firebase project
   (see "Point at a real Firebase project" above) — without them, Firestore
   denies everything by default and the app will look broken even with
   valid config.

## What's still on you

- Actually creating the Vercel project / connecting the GitHub repo — I
  can't do that from here, only prepare the repo for it.
- Export (HTML/embed/WebP) if you want the original tool's export feature
  carried over.
