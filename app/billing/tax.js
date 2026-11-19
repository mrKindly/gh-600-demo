// Tax math. All amounts are integer cents; tax is rounded once per invoice, half to even (banker's rounding).

/** Sales tax rate in basis points: 825 bps = 8.25%. */
export const TAX_RATE_BPS = 825;

/** Number of basis points in 100%. */
export const BPS_PER_UNIT = 10_000;

/**
 * Divides two integers and rounds half to even (banker's rounding), without storing fractions.
 * @param {number} numerator Non-negative integer.
 * @param {number} denominator Positive integer.
 * @returns {number} Integer quotient; an exact .5 goes to the nearest even integer.
 */
export const roundHalfEven = (numerator, denominator) => {
  if (!Number.isSafeInteger(numerator) || numerator < 0) {
    throw new RangeError('numerator must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new RangeError('denominator must be a positive safe integer');
  }
  const quotient = Math.floor(numerator / denominator);
  const twiceRemainder = 2 * (numerator - quotient * denominator);
  if (twiceRemainder < denominator) return quotient;
  if (twiceRemainder > denominator) return quotient + 1;
  return quotient + 1;
};
