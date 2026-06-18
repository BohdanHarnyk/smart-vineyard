import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Захист від розсинхрону повної та лайт-версій (O9 / ADR 0005).
// Замість ризикованого build-merge — автоматично ловимо дрейф спільних інваріантів у CI.
const full = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const lite = readFileSync(new URL('../index_clean.html', import.meta.url), 'utf8');

// Маркери, які МАЮТЬ бути в обох файлах (спільна логіка/інфраструктура).
const sharedMarkers = [
  './src/calc.js',                       // єдине джерело формул
  './styles.css',                        // зібраний Tailwind (O7)
  'Content-Security-Policy',             // CSP (O3)
  "navigator.serviceWorker.register('./sw.js'", // PWA (O8/0008)
  'function safeParse',                  // B1
  'function escapeHtml',                 // B5
  'function isBackupKey',                // O10
  'const GEMINI_FALLBACK_MODELS',        // B6
  'class="skip-link"',                   // O6
  'id="main-content"',                   // O6
];

describe('Синхронність index.html ↔ index_clean.html (O9)', () => {
  sharedMarkers.forEach((marker) => {
    it(`обидва файли містять: ${marker}`, () => {
      expect(full.includes(marker), `index.html не містить "${marker}"`).toBe(true);
      expect(lite.includes(marker), `index_clean.html не містить "${marker}"`).toBe(true);
    });
  });

  it('список запасних моделей Gemini ідентичний у обох версіях', () => {
    const grab = (src) => {
      const m = src.match(/const GEMINI_FALLBACK_MODELS = \[([\s\S]*?)\];/);
      return m ? m[1].replace(/\s+/g, '') : null;
    };
    const a = grab(full);
    const b = grab(lite);
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a).toBe(b);
  });

  it('пріоритетний список моделей discovery ідентичний у обох версіях', () => {
    const grab = (src) => {
      const m = src.match(/const preferredModels = \[([\s\S]*?)\];/);
      return m ? m[1].replace(/\s+/g, '') : null;
    };
    expect(grab(full)).toBe(grab(lite));
  });

  it('обидва підключають той самий CDN chart.js (закріплена версія)', () => {
    const grab = (src) => (src.match(/chart\.js@[\d.]+/) || [])[0];
    expect(grab(full)).toBe(grab(lite));
  });
});
