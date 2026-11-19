# Update the rounding rule

## Inputs

app/billing/tax.js, tests/billing.test.js

## Expected output

Invoice tax rounds half-up to whole cents (today it uses banker's rounding).
Add a test: an invoice with one `p-006` ($42.00) has tax $3.465 -> 347 cents ($3.47).

## Done when

All tests pass.
