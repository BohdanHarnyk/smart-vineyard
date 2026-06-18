// ESLint flat config — лінтує лише тестований модуль і тести (src/, test/).
// Великі HTML-файли навмисно поза охопленням (ADR 0001: монолітний vanilla SPA).
export default [
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
      'no-console': 'off'
    }
  }
];
