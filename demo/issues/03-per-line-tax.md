# Calculate tax per invoice line

## Problem

Customers ask to see the tax amount next to each invoice line. Today `computeInvoice` in `app/billing/invoice.js` calculates tax once from the invoice subtotal, so there is no per-line tax to show.

## Expected behavior

- Each item in `lines` gets a `tax` field: 8.25% of `lineTotal`, rounded half up.
- Invoice `tax` becomes the sum of the line taxes.
- `total` stays `subtotal + tax`.

## Acceptance criteria

- [ ] Change implemented in `app/billing/invoice.js`.
- [ ] Tests in `tests/billing.test.js` updated to cover per-line tax.
- [ ] `docs/api.md` shows the new `tax` field on lines.
- [ ] `npm test` passes. No new dependencies.
