# FIBERLINKGUARD — FTTH Operations Platform (F.L.G)

FIBERLINKGUARD (F.L.G) is a mobile-first React + TypeScript + Vite Progressive Web App for FTTH fibre technicians and network operations teams. It is a complete field toolkit: power checking, fault isolation, Bluetooth smart testing, inventory & GIS mapping, one-click provisioning, splicing QC, stock control, customer management, MTTR tracking and live monitoring — all running on-device and offline after the first load.

The app opens on a landing page with a download call-to-action. The full workspace is available after entering the app.

## Modules included

- **Landing page:** advertising, feature highlights and a download/install CTA for every phone and browser.
- **Overview:** workspace dashboard, recent readings, tool launcher, connection and install status.
- **Power check:** type a received dBm reading or capture it live over Bluetooth, then get an immediate plain-language interpretation. Save results to local history.
- **Unit converter:** dBm → watts (with formula) and kilometres ↔ metres (with formulas).
- **Fault locator:** enter power, LOS status and test point to isolate a break without climbing twice.
- **Inventory & GIS:** digital as-built for poles, joint boxes, splitters, OLTs and customers, with search, filtering and GPS tagging.
- **One-click provisioning:** activate a new subscriber in a single guided flow — port selection, ONT registration, VLAN assignment and verification.
- **Splicing QC:** document every splice with a photo and a measured loss; anything above threshold is flagged for a redo.
- **Stock & materials:** track cable in metres, sleeves, ONTs and patch cords; jobs deduct stock automatically.
- **Customers:** searchable subscriber list with plan, signal level and service state.
- **MTTR:** open and resolve fault tickets and measure mean time to repair.
- **Monitoring:** live signal levels across the OLT and splitters.
- **Reading history:** persistent local records in IndexedDB, available after refresh and offline; clear history.
- **Job listings:** searchable fibre installation and field-service opportunities from network partners.
- **Settings:** about, data management and field-feature notes.

## Tech and code organisation

- React 19, TypeScript, Vite 7, Tailwind CSS 4 Vite plugin, Lucide icons and `vite-plugin-pwa`.
- Page components are in `src/pages/`; shared components are in `src/components/`; styling is in `src/styles/` (organised, non-minified CSS).
- JSX contains no inline style attributes and uses arrow-function components.

## Run locally

1. Install a current Node.js LTS version compatible with Vite 7 (Node 20.19+ or Node 22.12+).
2. Open the project folder in an editor — the folder that contains `package.json`.
3. Open a terminal and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL Vite prints (usually `http://localhost:5173`).

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Optical limits — read before relying on an assessment

The initial illustrative GPON B+ range is **−27 dBm to −8 dBm**, reflecting example ONT receiver sensitivity/overload specifications. It is a reference only, not a universal pass/fail range for all FTTH networks or a guarantee of working internet. ITU-T G.984.2 describes GPON physical-layer specifications and optical parameters; actual assessment depends on network class, equipment, wavelength, measurement point and the operator's approved limits. Confirm the correct range before operational use. Users can edit both limits. A reading within range does not guarantee throughput, Wi-Fi performance or overall service health.

## Power conversion

- watts = 10^((dBm − 30) / 10)
- dBm is an absolute power level; dB is a ratio/difference.

## PWA, install and offline use

- Vite PWA generates the manifest and service worker; the production build precaches the app shell and assets.
- Calculations/conversions run locally. Saved readings use IndexedDB on that device; they are not cloud-synced. Clearing browser data can remove them.
- **First visit must be online** so the service worker can install and cache the app. Then reopen the deployed site at least once before testing offline.
- Deploy over **HTTPS** for PWA installability. The install action invokes the browser's native prompt when the browser exposes one. If it does not, FIBERLINKGUARD displays the actual manual steps. Browsers control whether a native prompt is available; a website cannot force installation.
- **Android:** open the HTTPS URL in Chrome, then use Install app / Add to Home screen. If the native prompt is available, the in-app button opens it.
- **iPhone/iPad:** open the HTTPS URL in Safari → Share → Add to Home Screen → Add. iOS does not generally expose the same web `beforeinstallprompt` event, so manual steps are required.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, select **Add New → Project** and import that repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy. Open the HTTPS deployment URL on the target phone, use the installation steps above, and test offline after the first online visit.

## Scope and honest limitations

This is a front-end application: no accounts, cloud sync, live vacancy database, real job application workflow or automatic physical fibre diagnosis. The threshold profile and job listings need confirmation before operational use. The app interprets values entered from physical meters; it does not measure light by itself. Bluetooth integration depends on the browser (Web Bluetooth works in Chrome/Edge, not iOS Safari).
