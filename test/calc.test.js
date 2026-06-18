import { describe, it, expect } from 'vitest';
import Calc from '../src/calc.js';

describe('Теплові одиниці (САТ/СЕТ)', () => {
  it('не враховує дні з T < 10°C', () => {
    expect(Calc.satContribution(9.9)).toBe(0);
    expect(Calc.setContribution(9.9)).toBe(0);
    expect(Calc.satContribution(-5)).toBe(0);
  });

  it('САТ = повна середньодобова температура в дні T >= 10°C', () => {
    expect(Calc.satContribution(10)).toBe(10);
    expect(Calc.satContribution(18.34)).toBe(18.3);
  });

  it('СЕТ = (T - 10) у дні T >= 10°C', () => {
    expect(Calc.setContribution(10)).toBe(0);
    expect(Calc.setContribution(18.34)).toBe(8.3);
  });

  it('накопичувальні суми за сезоном', () => {
    const r = Calc.cumulativeThermal([8, 10, 15, 20]);
    // SAT: 0 + 10 + 15 + 20 = 45 ; SET: 0 + 0 + 5 + 10 = 15
    expect(r.sat).toBe(45);
    expect(r.set).toBe(15);
  });

  it('порожній/невалідний ввід не ламає розрахунок', () => {
    expect(Calc.cumulativeThermal([])).toEqual({ sat: 0, set: 0 });
    expect(Calc.satContribution(undefined)).toBe(0);
    expect(Calc.satContribution(NaN)).toBe(0);
  });
});

describe('Лабораторія Гібереліну (ГК)', () => {
  it('маса препарату для 100% діючої речовини', () => {
    // 10 л × 50 ppm = 500 мг активної речовини; при 100% = 500 мг
    expect(Calc.ga3FormulationMg(10, 50, 100)).toBe(500);
  });

  it('масштабування за вмістом діючої речовини', () => {
    // при 50% препарату потрібно вдвічі більше маси
    expect(Calc.ga3FormulationMg(10, 50, 50)).toBe(1000);
  });

  it('за замовчуванням формулювання = 100%', () => {
    expect(Calc.ga3FormulationMg(10, 50)).toBe(500);
  });

  it('порожній ввід → 0 мг (без NaN)', () => {
    expect(Calc.ga3FormulationMg('', '', '')).toBe(0);
  });

  it('форматує результат: г для >= 1000 мг, інакше мг', () => {
    expect(Calc.formatGA3Result(500)).toBe('500 мг');
    expect(Calc.formatGA3Result(1500)).toBe('1.50 г');
    expect(Calc.formatGA3Result(999)).toBe('999 мг');
    expect(Calc.formatGA3Result(1000)).toBe('1.00 г');
  });
});

describe('Ризик мілдью (правило 6-6-26)', () => {
  it('високий ризик: дощ > 6 мм за 6–26°C', () => {
    expect(Calc.assessMildew(20, 8).risk).toBe('high');
    expect(Calc.assessMildew(6, 7).risk).toBe('high');
  });

  it('середній ризик: дощ > 2 мм за 8–28°C', () => {
    expect(Calc.assessMildew(20, 3).risk).toBe('medium');
  });

  it('низький ризик за сухої/холодної погоди', () => {
    expect(Calc.assessMildew(20, 0).risk).toBe('low');
    expect(Calc.assessMildew(3, 10).risk).toBe('low');
  });

  it('межі: рівно 6 мм дощу не дає високого ризику', () => {
    expect(Calc.assessMildew(20, 6).risk).not.toBe('high');
  });
});

describe('Ризик оїдіуму', () => {
  it('високий ризик: 15–25°C та вологість > 70%', () => {
    expect(Calc.assessOidium(20, 75).risk).toBe('high');
  });

  it('середній ризик: 12–28°C та вологість > 55%', () => {
    expect(Calc.assessOidium(27, 60).risk).toBe('medium');
  });

  it('низький ризик за сухого повітря', () => {
    expect(Calc.assessOidium(20, 40).risk).toBe('low');
  });
});
