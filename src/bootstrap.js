import Decimal from '../break_infinity.js';

globalThis.Decimal = Decimal;

(async function boot() {
  try {
    await import('./main.js');
  } catch (error) {
    console.error('Application bootstrap failed:', error);

    document.documentElement.classList.add('app-ready');
    if (document.body) {
      document.body.classList.remove('booting');
    }

    const errorBox = document.createElement('div');
    errorBox.setAttribute('role', 'alert');
    errorBox.textContent = `Boot Failure: ${String(error)}`;
    errorBox.style.position = 'absolute';
    errorBox.style.top = '20px';
    errorBox.style.left = '20px';
    errorBox.style.background = '#800000';
    errorBox.style.color = '#fff';
    errorBox.style.padding = '20px';
    errorBox.style.zIndex = '999999';
    
    if (document.body) {
      document.body.appendChild(errorBox);
    }

    throw error;
  }
})();
