# AGENTS.md

## Purpose
Smart Vineyard (Розумний Виноградник) is a client-only precision-viticulture platform
localized for Ukraine (Vinnytsia region). It helps a grower plan phase work, log operations,
track heat accumulation (САТ/GDD), assess disease/frost risk, manage a variety and
plant-protection-product database, and run agronomic calculators — with optional AI assistance.
Agents should optimize for: keeping the app fully serverless and offline-capable, preserving
user data in `localStorage`, and making minimal, scoped changes to a large single-file app.

## Repository shape
- Type: client-only SPA (no backend, no runtime bundler). Full version = `index.html` (markup) + `app.js` (logic); lite = `index_clean.html` (still inline)
- Main components (markup in `index.html`, logic in `app.js`):
  - Vegetation-phase calendar & checklists
  - deAgro Smart Diary (voice input + Gemini parsing, meteo-logging)
  - Adaptive analytics & AI auditor (САТ/GDD, Chart.js)
  - Disease & frost risk calculators
  - Variety library (122 varieties) + nursery
  - Plant-protection product DB (full CRUD, "reset to default")
  - Calculator center (NPK, tank mixes, gibberellic acid)
  - AI agro-chat assistant
- Important files/directories:
  - `index.html` — full version markup + CSP (NO inline JS — all logic is in `app.js`)
  - `app.js` — full version logic: event-delegation dispatcher, renders, data, calculators (see ADR 0009)
  - `sw-register.js` — externalized service-worker registration
  - `index_clean.html` — lite version (older UI, still inline JS; out of scope of redesign/O8 — see ADR 0005)
  - `styles.css` — compiled Tailwind, committed (regenerate via `npm run build:css`)
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
- Styling: Tailwind compiled to a committed `styles.css` (no Play CDN; see ADR 0007); design tokens + Golos Text + Lucide icons (see ADR 0010)
- Libraries (pinned CDN): Chart.js, twemoji, heic2any, Lucide
- Security: hardened CSP — `script-src 'self' https://cdn.jsdelivr.net`, no `unsafe-inline`/`unsafe-eval` (see ADR 0009)
- Persistence: browser `localStorage` (namespace `viticulture-*`)
- Integrations: Open-Meteo (forecast + archive APIs), Google Gemini API (browser-side,
  user-supplied key)
- Infrastructure/runtime: static hosting — canonical **Vercel** (see ADR 0006)

## Preferred commands
- Install: `npm install` (dev-only: Vitest, ESLint — not shipped)
- Dev: `python3 -m http.server 8000` then open `http://localhost:8000`
- Test: `npm test` (Vitest over `src/calc.js`); plus manual browser verification
- Lint: `npm run lint` (ESLint over `src/`, `test/`)
- Build CSS: `npm run build:css` (Tailwind → `styles.css`; regenerate and commit when classes change). `npm run watch:css` during dev.
- Build: none for runtime/hosting (HTML + committed `styles.css` served as-is; `src/calc.js` is a plain UMD script)

## Working rules for agents
- Prefer minimal, scoped changes — `app.js` is large (~7k lines); avoid broad rewrites.
- Full version: markup in `index.html`, logic in `app.js`. Interaction uses `data-action` + the delegation dispatcher — **never** inline `on*=` handlers (CSP blocks them). Complex args go through `dlg_*` wrappers reading `data-*`/event (ADR 0009).
- `index_clean.html` (lite) is a separate older artifact; `test/sync.test.js` enforces shared *logic* invariants across full↔lite, not UI.
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
The entire runtime is the browser. Full version: `index.html` holds markup + a hardened CSP and
loads `app.js` (all logic) and `sw-register.js`; lite `index_clean.html` keeps logic inline.
State is serialized per-module into `localStorage`; external calls go directly to Open-Meteo
(weather/САТ) and Gemini (AI) — no server boundary. UI is a sidebar (desktop) / bottom-nav +
drawer (mobile) with a Dashboard start screen (ADR 0010). All interaction is event-delegated via
`data-action` (ADR 0009) — there are zero inline handlers/scripts in the full version. Both entry
points share the same `localStorage` keys, so data is compatible.

## ADR index
- [0001 — Single-file vanilla SPA, no build step](docs/adr/0001-single-file-vanilla-spa.md) — the core dev model
- [0002 — localStorage as sole persistence](docs/adr/0002-localstorage-persistence.md) — all data is client-side
- [0003 — Client-side Gemini key in localStorage](docs/adr/0003-client-side-gemini-key.md) — AI calls + key handling/trade-offs
- [0004 — Open-Meteo as weather/САТ source](docs/adr/0004-open-meteo-weather-source.md) — external weather dependency
- [0005 — Dual entry points, manual sync](docs/adr/0005-dual-entry-points.md) — full vs lite HTML files
- [0006 — Static deployment topology](docs/adr/0006-static-deployment-topology.md) — GitHub Pages + Vercel (canonical TBD)
- [0007 — CDN dependencies, no vendoring](docs/adr/0007-cdn-dependencies.md) — runtime CDN reliance
- [0008 — PWA offline service worker](docs/adr/0008-pwa-offline-service-worker.md) — installability + offline caching strategy
- [0009 — Event delegation + CSP hardening](docs/adr/0009-event-delegation-csp-hardening.md) — externalized JS, zero inline, strict CSP
- [0010 — UI redesign: sidebar + dashboard](docs/adr/0010-ui-redesign-sidebar-dashboard.md) — navigation/dashboard/design system

## Decision precedence
1. Accepted ADRs (`docs/adr/`)
2. Explicit user instructions for the current task
3. Repository conventions already present in code and docs

## When adding a new ADR
- Save the ADR in `docs/adr/` using zero-padded sequential names (e.g. `0008-...md`).
- Link it from this file's ADR index.
- Prefer extending an existing ADR only when the decision is truly the same decision.
