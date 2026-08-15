import Decimal from 'break_infinity.js';

export function getEntropyBitProductionMultiplier(state) {
  const entropy = Number(state.era5?.entropy || 0);
  const informationRemaining = Decimal.max(0, new Decimal(100).minus(entropy));
  return new Decimal(1).plus(informationRemaining.div(100).times(0.5));
}
