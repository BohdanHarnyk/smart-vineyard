/** @type {import('tailwindcss').Config} */
// Сканує обидві точки входу (включно з інлайн-JS як текст) і генерує лише використані утиліти.
// Важливо: класи в коді мають бути цілими літералами (без конкатенації) — у проекті так і є.
export default {
  content: ['./index.html', './index_clean.html', './app.js'],
  theme: {
    extend: {},
  },
  plugins: [],
};
