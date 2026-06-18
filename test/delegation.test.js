import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Цілісність делегування подій (O8): кожен data-action у розмітці має відповідати реальній
// глобальній функції в тому ж файлі. Ловить друкарські помилки/орфани при міграції inline-обробників.
const files = {
  'index.html': readFileSync(new URL('../index.html', import.meta.url), 'utf8'),
  'index_clean.html': readFileSync(new URL('../index_clean.html', import.meta.url), 'utf8'),
};

function dataActions(src) {
  const set = new Set();
  const re = /data-action="([a-zA-Z0-9_]+)"/g;
  let m;
  while ((m = re.exec(src))) set.add(m[1]);
  return [...set];
}

describe('Цілісність делегування подій (O8)', () => {
  Object.entries(files).forEach(([name, src]) => {
    it(`${name}: усі data-action мають визначену функцію`, () => {
      const actions = dataActions(src);
      expect(actions.length).toBeGreaterThan(0);
      for (const action of actions) {
        const defined = new RegExp(`function\\s+${action}\\s*\\(`).test(src);
        expect(defined, `${name}: data-action="${action}" не має function ${action}(`).toBe(true);
      }
    });

    it(`${name}: делегатор подій присутній`, () => {
      expect(src.includes('initEventDelegation')).toBe(true);
    });
  });

  it('навігація переведена на делегування в обох файлах', () => {
    for (const [name, src] of Object.entries(files)) {
      expect(src.includes('onclick="switchTab'), `${name}: лишився inline switchTab`).toBe(false);
      const count = (src.match(/data-action="switchTab"/g) || []).length;
      expect(count, `${name}: очікувалось 8 нав-кнопок`).toBe(8);
    }
  });
});
