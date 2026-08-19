import Decimal from 'break_infinity.js';

function asDecimal(value) {
  return value instanceof Decimal ? value : new Decimal(value || 0);
}

/**
 * Formats a visible resource stock / balance or whole number quantity.
 * Visible stocks use whole numbers (floored for non-negative balances)
 * to prevent displaying values as affordable before authoritative state is reached.
 */
export function formatHudNumber(value) {
  const decimal = asDecimal(value);
  const absolute = decimal.abs();

  if (absolute.lt(1000)) {
    const floorNum = decimal.gte(0) ? Math.floor(decimal.toNumber()) : Math.ceil(decimal.toNumber());
    return floorNum.toLocaleString('en-US');
  }
  if (absolute.lt(1e6)) {
    const floorNum = decimal.gte(0) ? Math.floor(decimal.toNumber()) : Math.ceil(decimal.toNumber());
    return floorNum.toLocaleString('en-US');
  }
  if (absolute.lt(1e9)) return `${(decimal.toNumber() / 1e6).toFixed(2)}M`;
  if (absolute.lt(1e12)) return `${(decimal.toNumber() / 1e9).toFixed(2)}B`;
  if (absolute.lt(1e15)) return `${(decimal.toNumber() / 1e12).toFixed(2)}T`;
  return decimal.toExponential(2);
}

/**
 * Formats thermal reaction capability multiplier uniformly (e.g. 1.00×, 2.71×, 4.54×).
 */
export function formatThermalCapability(value) {
  const decimal = asDecimal(value);
  const num = decimal.toNumber();
  return `${num.toFixed(2)}×`;
}

/**
 * Formats process network flow rates with sufficient decimal precision for close rates.
 */
export function formatHudFlowRate(value) {
  const decimal = asDecimal(value);
  const num = decimal.toNumber();
  if (num === 0) return '0 /s';
  if (num < 100) {
    const formatted = Number.isInteger(num)
      ? num.toString()
      : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${formatted} /s`;
  }
  if (num < 1000) {
    const formatted = Math.floor(num).toLocaleString('en-US');
    return `${formatted} /s`;
  }
  return `${formatHudNumber(decimal)} /s`;
}

/**
 * Formats a value with an optional unit.
 * Percentages and thermal multipliers retain meaningful decimal precision.
 */
export function formatHudValue(value, unit = '') {
  if (unit === '×' || unit === 'x') {
    return formatThermalCapability(value);
  }
  if (unit === '/s') {
    return formatHudFlowRate(value);
  }
  if (unit === '%') {
    const decimal = asDecimal(value);
    const num = decimal.toNumber();
    const formatted = Number.isInteger(num) ? num.toString() : num.toLocaleString('en-US', { maximumFractionDigits: 1 });
    return `${formatted}%`;
  }
  const formatted = formatHudNumber(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Formats production and conversion rates, retaining meaningful decimal precision.
 */
export function formatHudRate(value, unit = '') {
  const decimal = asDecimal(value);
  if (decimal.eq(0)) return '';

  const sign = decimal.gt(0) ? '+' : '−';
  const absolute = decimal.abs();
  let formatted = '';
  if (absolute.lt(10)) {
    const num = absolute.toNumber();
    const fractionDigits = Number.isInteger(num) ? 0 : 2;
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
  } else if (absolute.lt(1000)) {
    const num = absolute.toNumber();
    const fractionDigits = Number.isInteger(num) ? 0 : 1;
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
  } else {
    formatted = formatHudNumber(absolute);
  }
  return `${sign}${formatted}${unit ? ` ${unit}` : ''}/s`;
}

export function getRateDirection(value) {
  const decimal = asDecimal(value);
  if (decimal.gt(0)) return 'positive';
  if (decimal.lt(0)) return 'negative';
  return 'idle';
}
