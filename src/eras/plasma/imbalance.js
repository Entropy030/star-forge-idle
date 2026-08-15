/* global Decimal */
export function getQuarkGluonImbalanceMultiplier(state) {
  const quarks = state.resources.quarks.amount;
  const gluons = state.resources.gluons.amount;
  if (quarks.eq(0) || gluons.eq(0)) return new Decimal(1);

  const difference = quarks.minus(gluons).abs().max(1);
  return new Decimal(1).plus(new Decimal(difference.log10()).times(0.05));
}
