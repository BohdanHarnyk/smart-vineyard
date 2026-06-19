import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Захист від розсинхрону повної та лайт-версій (O9 / ADR 0005).
// Повна версія тепер винесена: index.html + app.js + sw-register.js. Лайт — все інлайн.
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const full = [read('index.html'), read('app.js'), read('sw-register.js')].join('\n');
const lite = read('index_clean.html');

const sharedMarkers = [
  './src/calc.js',
  './styles.css',
  'Content-Security-Policy',
  "navigator.serviceWorker.register('./sw.js'",
  'function safeParse',
  'function escapeHtml',
  'function isBackupKey',
  'const GEMINI_FALLBACK_MODELS',
  'class="skip-link"',
  'id="main-content"',
];

describe('Синхронність повної (index.html+app.js) ↔ лайт (index_clean.html) (O9)', () => {
  sharedMarkers.forEach((marker) => {
    it(`обидві версії містять: ${marker}`, () => {
      expect(full.includes(marker), `повна версія не містить "${marker}"`).toBe(true);
      expect(lite.includes(marker), `index_clean.html не містить "${marker}"`).toBe(true);
    });
  });

  it('список запасних моделей Gemini ідентичний у обох версіях', () => {
    const grab = (src) => {
      const m = src.match(/const GEMINI_FALLBACK_MODELS = \[([\s\S]*?)\];/);
      return m ? m[1].replace(/\s+/g, '') : null;
    };
    expect(grab(full)).not.toBeNull();
    expect(grab(full)).toBe(grab(lite));
  });

  it('пріоритетний список моделей discovery ідентичний', () => {
    const grab = (src) => {
      const m = src.match(/const preferredModels = \[([\s\S]*?)\];/);
      return m ? m[1].replace(/\s+/g, '') : null;
    };
    expect(grab(full)).toBe(grab(lite));
  });
});
