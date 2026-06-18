/*
 * Smart Vineyard — чисті агрономічні розрахунки.
 *
 * Єдине джерело істини для формул САТ/СЕТ, гібереліну (ГК) та класифікації ризику хвороб.
 * UMD-модуль: працює і в браузері (звичайний <script src> → window.Calc), і в Node (require)
 * для юніт-тестів (Vitest). Жодних залежностей і жодного звертання до DOM — лише математика.
 *
 * ВАЖЛИВО: формули мають точно відповідати поведінці index.html / index_clean.html (ADR 0005).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Calc = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Округлення до 1 знака після коми — як у застосунку (parseFloat(x.toFixed(1))).
  function round1(x) {
    return parseFloat(Number(x).toFixed(1));
  }

  // --- Теплові одиниці (САТ / СЕТ) ---
  // САТ: середньодобова температура враховується повністю в дні з T >= 10°C.
  function satContribution(temp) {
    return Number(temp) >= 10 ? round1(temp) : 0;
  }

  // СЕТ (GDD): (T - 10) у дні з T >= 10°C.
  function setContribution(temp) {
    return Number(temp) >= 10 ? round1(Number(temp) - 10) : 0;
  }

  // Накопичувальні суми за масивом середньодобових температур.
  function cumulativeThermal(temps) {
    var sat = 0;
    var set = 0;
    (temps || []).forEach(function (t) {
      sat += satContribution(t);
      set += setContribution(t);
    });
    return { sat: round1(sat), set: round1(set) };
  }

  // --- Лабораторія Гібереліну (ГК) ---
  // Маса комерційного препарату (мг) для досягнення цільової концентрації.
  //   volumeL        — об'єм розчину, л
  //   ppm            — цільова концентрація, мг/л (ppm)
  //   formulationPct — вміст діючої речовини в препараті, % (за замовч. 100)
  function ga3FormulationMg(volumeL, ppm, formulationPct) {
    var vol = Number(volumeL) || 0;
    var conc = Number(ppm) || 0;
    var pct = Number(formulationPct) || 100;
    var activeSubstanceMg = vol * conc;
    return (activeSubstanceMg * 100) / pct;
  }

  // Форматування результату ГК: грами, якщо >= 1000 мг, інакше міліграми.
  function formatGA3Result(formulationMg) {
    if (formulationMg >= 1000) {
      return (formulationMg / 1000).toFixed(2) + ' г';
    }
    return Math.round(formulationMg) + ' мг';
  }

  // --- Класифікація ризику хвороб ---
  // Мілдью (правило 6-6-26): дощ > 6 мм за температури 6–26°C.
  function assessMildew(temp, rain) {
    var t = Number(temp) || 0;
    var r = Number(rain) || 0;
    if (r > 6 && t >= 6 && t <= 26) {
      return {
        risk: 'high',
        advice: '🚨 КРИТИЧНИЙ РИЗИК! Правило 6-6-26 спрацювало. Неминучий спалах мілдью через 7-10 днів. Обов\'язково внесіть Акробат або Танос на випередження!'
      };
    }
    if (r > 2 && t >= 8 && t <= 28) {
      return {
        risk: 'medium',
        advice: '⚠️ Підвищений ризик. Волога лоза сприяє поширенню інфекції. Проведіть обробку контактним мідьвмісним препаратом при першій нагоді.'
      };
    }
    return {
      risk: 'low',
      advice: 'Умови безпечні. Профілактичні заходи за календарем фаз.'
    };
  }

  // Оїдіум: оптимум 15–25°C за високої вологості (навіть без дощу).
  function assessOidium(temp, humidity) {
    var t = Number(temp) || 0;
    var h = Number(humidity) || 0;
    if (t >= 15 && t <= 25 && h > 70) {
      return {
        risk: 'high',
        advice: '🚨 КРИТИЧНИЙ РИЗИК! Поєднання помірної температури та високої вологості ідеальне для оїдіуму. Обов\'язково застосуйте Луна Експірієнс або Сірку (Тіовіт Джет).'
      };
    }
    if (t >= 12 && t <= 28 && h > 55) {
      return {
        risk: 'medium',
        advice: '⚠️ Помірний ризик. Сприятливі умови для розвитку спор. Забезпечте провітрювання грон (видалення листя) та обробіть профілактично.'
      };
    }
    return {
      risk: 'low',
      advice: 'Умови безпечні. Профілактика сіркою за планом.'
    };
  }

  return {
    round1: round1,
    satContribution: satContribution,
    setContribution: setContribution,
    cumulativeThermal: cumulativeThermal,
    ga3FormulationMg: ga3FormulationMg,
    formatGA3Result: formatGA3Result,
    assessMildew: assessMildew,
    assessOidium: assessOidium
  };
}));
