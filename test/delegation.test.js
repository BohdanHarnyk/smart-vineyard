import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Цілісність делегування подій (O8): кожен data-action у розмітці/шаблонах має відповідати
// реальній глобальній функції. Ловить орфани/друкарські помилки при міграції inline-обробників.
const src = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function dataActions(s) {
  const set = new Set();
  const re = /data-action="([a-zA-Z0-9_]+)"/g;
  let m;
  while ((m = re.exec(s))) set.add(m[1]);
  return [...set];
}

describe('Делегування подій (O8)', () => {
  it('диспетчер присутній', () => {
    expect(src.includes('initEventDelegation')).toBe(true);
  });

  it('усі data-action мають визначену функцію', () => {
    const actions = dataActions(src);
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      const defined = new RegExp(`function\\s+${a}\\s*\\(`).test(src);
      expect(defined, `data-action="${a}" не має function ${a}(`).toBe(true);
    }
  });

  it('навігація (sidebar + bottom-nav) переведена на делегування', () => {
    expect(src.includes('onclick="switchTab')).toBe(false);
    const count = (src.match(/data-action="switchTab"/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(12);
  });
});
