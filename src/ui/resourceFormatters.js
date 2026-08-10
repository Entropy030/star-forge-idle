import Decimal from 'break_infinity.js';

function asDecimal(value) {
  return value instanceof Decimal ? value : new Decimal(value || 0);
}

export function formatHudNumber(value) {
  const decimal = asDecimal(value);
  const absolute = decimal.abs();

  if (absolute.lt(1000)) {
    const number = decimal.toNumber();
    const fractionDigits = Number.isInteger(number) ? 0 : Math.abs(number) < 10 ? 2 : 1;
    return number.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
  }
  if (absolute.lt(1e6)) return Math.round(decimal.toNumber()).toLocaleString('en-US');
  if (absolute.lt(1e9)) return `${(decimal.toNumber() / 1e6).toFixed(2)}M`;
  if (absolute.lt(1e12)) return `${(decimal.toNumber() / 1e9).toFixed(2)}B`;
  if (absolute.lt(1e15)) return `${(decimal.toNumber() / 1e12).toFixed(2)}T`;
  return decimal.toExponential(2);
}

export function formatHudValue(value, unit = '') {
  const formatted = formatHudNumber(value);
  return unit === '%' ? `${formatted}%` : unit ? `${formatted} ${unit}` : formatted;
}

export function formatHudRate(value, unit = '') {
  const decimal = asDecimal(value);
  if (decimal.eq(0)) return '';

  const sign = decimal.gt(0) ? '+' : '−';
  const formatted = formatHudNumber(decimal.abs());
  return `${sign}${formatted}${unit ? ` ${unit}` : ''}/s`;
}

export function getRateDirection(value) {
  const decimal = asDecimal(value);
  if (decimal.gt(0)) return 'positive';
  if (decimal.lt(0)) return 'negative';
  return 'idle';
}
