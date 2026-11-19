// ⚠️ FINANCE-CRITICAL. Changes require review by the finance code owner.
// Tax is rounded once per invoice, not per line. Do not change without approval.

/** Sales tax rate in basis points: 825 bps = 8.25%. */
export const TAX_RATE_BPS = 825;

/** Number of basis points in 100%. */
export const BPS_PER_UNIT = 10_000;

/**
 * Divides two integers and rounds the result half up, without storing fractions.
 * @param {number} numerator Non-negative integer.
 * @param {number} denominator Positive integer.
 * @returns {number} Integer quotient rounded half up.
 */
export const roundHalfUp = (numerator, denominator) => {
  if (!Number.isSafeInteger(numerator) || numerator < 0) {
    throw new RangeError('numerator must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new RangeError('denominator must be a positive safe integer');
  }
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
};
