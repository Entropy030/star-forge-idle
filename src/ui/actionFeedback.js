import Decimal from 'break_infinity.js';
import { formatHudNumber } from './resourceFormatters.js';

const SAFE_FALLBACK = 'Upgrade requirements are not satisfied.';
const INVALID_PLAYER_TEXT = /(?:undefined|null|nan|\[object object\])/i;

export function isActionSuccessful(result) {
  return Boolean(result && (result.success === true || result.ok === true));
}

export function getActionFailureMessage(result, fallback = SAFE_FALLBACK) {
  const message = typeof result?.message === 'string' ? result.message.trim() : '';
  if (message && !INVALID_PLAYER_TEXT.test(message)) return message;

  const currency = typeof result?.currency === 'string' ? result.currency.trim() : '';
  try {
    const cost = new Decimal(result?.cost);
    const formattedCost = formatHudNumber(cost);
    if (cost.gt(0) && currency && !INVALID_PLAYER_TEXT.test(`${formattedCost} ${currency}`)) {
      return `Requires ${formattedCost} ${currency}`;
    }
  } catch {
    // Invalid command metadata falls through to the contextual safe message.
  }

  return fallback;
}
