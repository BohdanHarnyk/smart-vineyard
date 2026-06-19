import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// O8 повний: index.html не має інлайн-скриптів/обробників; уся логіка — у app.js.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function dataActions(s) {
  const set = new Set();
  const re = /data-action="([a-zA-Z0-9_]+)"/g;
  let m;
  while ((m = re.exec(s))) set.add(m[1]);
  return [...set];
}

describe('Делегування подій (O8)', () => {
  it('диспетчер присутній у app.js', () => {
    expect(app.includes('initEventDelegation')).toBe(true);
  });

  it('усі data-action мають визначену функцію в app.js', () => {
    const actions = dataActions(html);
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      expect(new RegExp(`function\\s+${a}\\s*\\(`).test(app), `немає function ${a}(`).toBe(true);
    }
  });

  it('нуль inline-обробників подій у index.html', () => {
    expect(/on(click|change|input|submit|keydown|keyup)=/.test(html), 'лишився inline-обробник').toBe(false);
  });

  it('нуль inline <script> у index.html (передумова для CSP без unsafe-inline)', () => {
    expect(html.includes('<script>'), 'лишився inline <script>').toBe(false);
  });

  it('CSP script-src не містить unsafe-inline/unsafe-eval', () => {
    const csp = (html.match(/script-src[^;]*;/) || [''])[0];
    expect(csp.includes('unsafe-inline')).toBe(false);
    expect(csp.includes('unsafe-eval')).toBe(false);
  });
});
