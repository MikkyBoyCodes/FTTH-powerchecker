# RX Guard — Optical Power Checker

RX Guard is a mobile-first React + TypeScript + Vite Progressive Web App for fibre technicians. Primary workflow: enter the optical meter’s received-power reading in dBm → get an immediate interpretation → optionally save the check. Power converter and job listings are secondary features.

## Pages

- **Overview** — launch into the optical checker, status, recent checks, install app
- **Optical power checker** — enter dBm, assess below / within / above range, save
- **Power converter** — watts ↔ dBm with formulas
- **Reading history** — local IndexedDB records
- **Job listings** — concept directory for fibre field roles (illustrative)

## Tech

- React 19, TypeScript, Vite 7, Tailwind CSS 4, Lucide icons, `vite-plugin-pwa`
- Pages: `src/pages/` · Components: `src/components/`
- **Styles (separated):**
  - `src/styles/variables.css` — design tokens
  - `src/styles/animations.css` — motion / transitions
  - `src/styles/base.css` — layout & UI components
  - `src/styles/responsive.css` — phone / tablet breakpoints
  - `src/styles/index.css` — entry (imports the above + fonts)

## Run locally

1. Install Node.js LTS (20.19+ or 22.12+).
2. Open the `rx-guard` folder (the one that contains `package.json`).
3. In the terminal:

```bash
npm install
npm run dev
```

4. Open the URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Optical limits

Illustrative GPON B+ range: **−27 dBm to −8 dBm**. Editable. Not a universal pass/fail for all networks. Client must confirm real limits.

## Power conversion (verified)

- dBm = 10 × log₁₀(power in watts) + 30  
- watts = 10^((dBm − 30) / 10)  

Zero watts has no finite dBm value.

## Deploy to Vercel (recommended for PWA)

1. Push the `rx-guard` folder to a GitHub repository (do **not** commit `node_modules`).
2. In [Vercel](https://vercel.com): **Add New → Project** → import the repo.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy. You get an HTTPS URL (required for install).

## Install on a phone (for non-technical users)

Share the **HTTPS Vercel link**. The person does this once while online:

### Android (Chrome)

1. Open the link in **Chrome**.
2. Tap the **⋮** menu (top right).
3. Choose **Install app** or **Add to Home screen**.
4. Confirm. RX Guard appears on the home screen like a normal app.

You can also tap **Install app** / **Install options** inside RX Guard; if the browser supports it, the install prompt opens automatically.

### iPhone / iPad (Safari only)

1. Open the link in **Safari** (not Chrome).
2. Tap the **Share** button (square with arrow).
3. Scroll and tap **Add to Home Screen**.
4. Tap **Add**.

After the first online visit, the app works offline for core tools and saved readings.

## Console notes (development)

- **Manifest syntax error** on `localhost` is normal in pure dev mode; the real manifest is generated on `npm run build` / Vercel.
- **MaxListenersExceededWarning** / **ObjectMultiplex** messages usually come from browser extensions (wallets, React tools), not from RX Guard itself.
- Use the production URL for a clean install experience.

## Scope

Front-end prototype only: no accounts, cloud sync, live job database, or meter Bluetooth. Limits and job workflow need client confirmation.
