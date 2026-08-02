import importPlugin from 'eslint-plugin-import';

export default [
  {
    plugins: {
      import: importPlugin
    },
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        Decimal: 'readonly',
        break_infinity: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        isNaN: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        prompt: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        URLSearchParams: 'readonly',
        CustomEvent: 'readonly', confirm: 'readonly', alert: 'readonly'
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'import/no-cycle': ['error', { maxDepth: '∞' }]
    }
  },
  {
    files: ['src/engine/**/*.js', 'src/state/**/*.js', 'src/eras/**/*.js', 'src/systems/**/*.js'],
    rules: {
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'localStorage',
        'sessionStorage',
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date', // Should use injected clock/now
        'performance',
        'alert',
        'confirm',
        'prompt',
        'CustomEvent'
      ]
    }
  }
];
