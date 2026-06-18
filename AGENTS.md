# AGENTS.md

## Purpose
Smart Vineyard (Розумний Виноградник) is a client-only precision-viticulture platform
localized for Ukraine (Vinnytsia region). It helps a grower plan phase work, log operations,
track heat accumulation (САТ/GDD), assess disease/frost risk, manage a variety and
plant-protection-product database, and run agronomic calculators — with optional AI assistance.
Agents should optimize for: keeping the app fully serverless and offline-capable, preserving
user data in `localStorage`, and making minimal, scoped changes to a large single-file app.

## Repository shape
- Type: single-file, client-only SPA (no backend, no build step)
- Main components (all inside `index.html`):
  - Vegetation-phase calendar & checklists
  - deAgro Smart Diary (voice input + Gemini parsing, meteo-logging)
  - Adaptive analytics & AI auditor (САТ/GDD, Chart.js)
  - Disease & frost risk calculators
  - Variety library (122 varieties) + nursery
  - Plant-protection product DB (full CRUD, "reset to default")
  - Calculator center (NPK, tank mixes, gibberellic acid)
  - AI agro-chat assistant
- Important files/directories:
  - `index.html` — full version; new features are developed and tested here first
  - `index_clean.html` — lite version, manually kept in sync (see ADR 0005)
  - `manifest.webmanifest`, `sw.js`, `icon.svg`, `icon-maskable.svg` — PWA shell (see ADR 0008)
  - `src/calc.js` — pure agro formulas (UMD: `window.Calc` in browser, `require` in Node); single source for SAT/SET, GA, disease-risk
  - `test/calc.test.js` — Vitest tests for `src/calc.js`
  - `package.json`, `eslint.config.js`, `.github/workflows/ci.yml` — dev-only toolchain (no runtime build)
  - `vercel.json` — SPA rewrite for static hosting
  - `docs/superpowers/specs/` — feature design specs
  - `docs/adr/` — architecture decision records (source of truth)
  - `README.md` — user-facing feature documentation (Ukrainian)

> Note: `gemini.md` is a leftover generic agent template (3-layer directives/execution model)
> and does NOT describe this repository's architecture. Ignore it for architectural decisions.

## Stack and tooling
- Languages/frameworks: HTML5, Vanilla JavaScript (ES6+)
- Styling: Tailwind CSS compiled to a committed `styles.css` (no Play CDN; see ADR 0007)
- Libraries (all via CDN, no package manager): Chart.js, twemoji, heic2any
- Persistence: browser `localStorage` (namespace `viticulture-*`)
- Integrations: Open-Meteo (forecast + archive APIs), Google Gemini API (browser-side,
  user-supplied key)
- Infrastructure/runtime: static hosting (GitHub Pages and/or Vercel)

## Preferred commands
- Install: `npm install` (dev-only: Vitest, ESLint — not shipped)
- Dev: `python3 -m http.server 8000` then open `http://localhost:8000`
- Test: `npm test` (Vitest over `src/calc.js`); plus manual browser verification
- Lint: `npm run lint` (ESLint over `src/`, `test/`)
- Build CSS: `npm run build:css` (Tailwind → `styles.css`; regenerate and commit when classes change). `npm run watch:css` during dev.
- Build: none for runtime/hosting (HTML + committed `styles.css` served as-is; `src/calc.js` is a plain UMD script)

## Working rules for agents
- Prefer minimal, scoped changes — `index.html` is ~9,400 lines; avoid broad rewrites.
- When you change shared data logic (CRUD, localStorage, calculators), apply the same change
  to `index_clean.html` in the same commit (ADR 0005).
- Keep new persistence keys under the `viticulture-*` namespace (ADR 0002).
- Never hardcode or commit real API keys; the Gemini key is user-supplied (ADR 0003).
- Pin CDN dependency versions when adding or updating them (ADR 0007).
- When changing the app shell or caching strategy, bump `VERSION` in `sw.js` (ADR 0008).
- Agro formulas (SAT/SET, GA, disease risk) live in `src/calc.js` — change them there and update `test/calc.test.js`; call `Calc.*` from the HTML rather than re-inlining the math.
- Run `npm test` and `npm run lint` before considering a change to formulas done.
- After adding/removing Tailwind classes in the HTML, run `npm run build:css` and commit the updated `styles.css` (ADR 0007). Build classes as whole literal strings — never concatenate class names (`'bg-' + x`), or the build will purge them.
- New external origins must be added to the CSP meta in both HTML files (ADR 0003).
- Update tests/docs and the relevant ADR when behavior or a decision changes.
- Do not introduce a build step, backend, or new architecture without checking ADRs first.

## Architecture notes
The entire runtime is the browser. UI, business logic, and persistence live in one HTML file;
state is serialized per-module into `localStorage`. External calls go directly from the
browser to Open-Meteo (weather/САТ) and Gemini (AI features) — there is no server boundary.
The lite `index_clean.html` shares the same storage keys, so data is compatible across both
entry points.

## ADR index
- [0001 — Single-file vanilla SPA, no build step](docs/adr/0001-single-file-vanilla-spa.md) — the core dev model
- [0002 — localStorage as sole persistence](docs/adr/0002-localstorage-persistence.md) — all data is client-side
- [0003 — Client-side Gemini key in localStorage](docs/adr/0003-client-side-gemini-key.md) — AI calls + key handling/trade-offs
- [0004 — Open-Meteo as weather/САТ source](docs/adr/0004-open-meteo-weather-source.md) — external weather dependency
- [0005 — Dual entry points, manual sync](docs/adr/0005-dual-entry-points.md) — full vs lite HTML files
- [0006 — Static deployment topology](docs/adr/0006-static-deployment-topology.md) — GitHub Pages + Vercel (canonical TBD)
- [0007 — CDN dependencies, no vendoring](docs/adr/0007-cdn-dependencies.md) — runtime CDN reliance
- [0008 — PWA offline service worker](docs/adr/0008-pwa-offline-service-worker.md) — installability + offline caching strategy

## Decision precedence
1. Accepted ADRs (`docs/adr/`)
2. Explicit user instructions for the current task
3. Repository conventions already present in code and docs

## When adding a new ADR
- Save the ADR in `docs/adr/` using zero-padded sequential names (e.g. `0008-...md`).
- Link it from this file's ADR index.
- Prefer extending an existing ADR only when the decision is truly the same decision.
