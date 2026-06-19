# CHANGELOG — Smart Vineyard

Хронологія значних змін. Деталі рішень — в [docs/adr/](docs/adr/), план — в
[docs/optimization-plan.md](docs/optimization-plan.md), огляд для агентів — в [AGENTS.md](AGENTS.md).

## 2026-06 — Оптимізація, надійність, редизайн і CSP-хардненг

Масштабний цикл: безпека/надійність → тести/CI → PWA → редизайн UI → повне делегування подій
із жорстким CSP. Усе доведено в прод через цикл «гілка → Vercel preview → ручний QA → мерж».

### Архітектура / структура
- **Винесено логіку** повної версії з інлайн-`<script>` у `app.js` (уся логіка) та
  `sw-register.js` (реєстрація SW). `index.html` тепер — лише розмітка + CSP. ([ADR 0009](docs/adr/0009-event-delegation-csp-hardening.md))
- **Чисті агро-формули** (САТ/СЕТ, гіберелін, ризики хвороб) — у `src/calc.js` (UMD, єдине
  джерело), покрито Vitest. ([ADR 0001 уточнення](docs/adr/0001-single-file-vanilla-spa.md))
- **Tailwind** — зібраний `styles.css` (`npm run build:css`) замість Play CDN. ([ADR 0007](docs/adr/0007-cdn-dependencies.md))
- **Канонічний хостинг** — Vercel (`smart-vineyard.vercel.app`). ([ADR 0006](docs/adr/0006-static-deployment-topology.md))

### Безпека
- **CSP** додано, потім посилено до `script-src 'self' https://cdn.jsdelivr.net` —
  **без `unsafe-inline` і `unsafe-eval`**. ([ADR 0009](docs/adr/0009-event-delegation-csp-hardening.md), [ADR 0003](docs/adr/0003-client-side-gemini-key.md))
- **Делегування подій:** усі ~184 inline-обробники → `data-action` + диспетчер `document`;
  складні — через `dlg_*` wrappers. **0 inline-обробників, 0 inline `<script>`.**
- `escapeHtml` на сінках AI-чату; попередження про локальне зберігання ключа Gemini;
  бекап даних **без** API-ключа.

### PWA / офлайн
- `manifest.webmanifest` + `sw.js` (network-first навігація, stale-while-revalidate статика/CDN,
  network-only API) + іконки. Встановлюваність і офлайн-старт. ([ADR 0008](docs/adr/0008-pwa-offline-service-worker.md))

### Редизайн UI (5 спринтів) — [ADR 0010](docs/adr/0010-ui-redesign-sidebar-dashboard.md)
- Sidebar (desktop) + bottom-nav та висувна шухляда (mobile).
- Dashboard «Огляд» (стартовий): stat-картки, таймлайн фаз, загрози, чекліст задач — реальні дані.
- AI suggested prompts (порожній стан чату); Quick Log FAB; Golos Text; Lucide-іконки.

### Якість / процеси
- **Vitest** (34 тести: формули, цілісність делегування, drift-guard повна↔лайт) + **ESLint** + **CI**
  (`.github/workflows/ci.yml`).
- Доступність: skip-link, landmarks, `aria-current`, `aria-live`, focus-visible.
- Виправлені баги: пошкоджений `localStorage` (safeParse), кнопка AI-кандидата, моделі Gemini,
  string/number-id після міграції (журнал, бакові суміші).

### Виправлено помилки під час QA
- Журнал операцій: галочка не ставилась / запис не переходив у «виконані» — строге порівняння
  числового id з рядковим `data-action-param`; виправлено на нестроге `==`/`!=`.

## Структура файлів (після змін)
```
index.html            # розмітка + CSP (без інлайн-JS)
app.js                # уся логіка застосунку (делегування, рендери, дані)
sw-register.js        # реєстрація service worker
sw.js                 # service worker (PWA)
src/calc.js           # чисті формули (UMD; тестується)
src/input.css         # вхід Tailwind
styles.css            # зібраний Tailwind (комітиться)
manifest.webmanifest  # PWA
icon.svg / icon-maskable.svg
index_clean.html      # лайт-версія (старий UI, інлайн-JS — поза скоупом редизайну/O8)
test/                 # Vitest: calc, delegation, sync
tailwind.config.js, eslint.config.js, package.json
docs/adr/             # ADR 0001–0010 (джерело істини рішень)
docs/                 # план, аналіз, специфікація
```
