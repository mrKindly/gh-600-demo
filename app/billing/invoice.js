// Tax math. All amounts are integer cents; tax is rounded once per invoice, half to even (banker's rounding).

import { BPS_PER_UNIT, TAX_RATE_BPS, roundHalfEven } from './tax.js';

/**
 * @typedef {import('../products.js').Product} Product
 * @typedef {{ productId: string, quantity: number }} InvoiceRequestLine
 * @typedef {{ productId: string, quantity: number, priceCents: number, lineTotal: number }} InvoiceLine
 * @typedef {{ lines: InvoiceLine[], subtotal: number, tax: number, total: number }} Invoice
 */

/**
 * Computes an invoice. All amounts are integer cents.
 * Pure function: input is expected to be validated by the caller.
 * @param {InvoiceRequestLine[]} lines
 * @param {readonly Product[]} catalog
 * @returns {Invoice}
 */
export const computeInvoice = (lines, catalog) => {
  const priceById = new Map(catalog.map((product) => [product.id, product.priceCents]));

  const invoiceLines = lines.map(({ productId, quantity }) => {
    const priceCents = priceById.get(productId);
    if (priceCents === undefined) throw new RangeError(`Unknown productId: ${productId}`);
    return { productId, quantity, priceCents, lineTotal: priceCents * quantity };
  });

  const subtotal = invoiceLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const tax = roundHalfEven(subtotal * TAX_RATE_BPS, BPS_PER_UNIT);

  return { lines: invoiceLines, subtotal, tax, total: subtotal + tax };
};
