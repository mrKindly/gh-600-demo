import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from '../app/api.js';
import { computeInvoice } from '../app/billing/invoice.js';
import { BPS_PER_UNIT, TAX_RATE_BPS, roundHalfEven } from '../app/billing/tax.js';
import { listProducts } from '../app/products.js';

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

const catalog = listProducts();

const postInvoice = (body) => fetch(`${baseUrl}/invoices`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

describe('roundHalfEven', () => {
  it('rounds an exact .5 to the nearest even integer', () => {
    assert.equal(roundHalfEven(5, 10), 0);
    assert.equal(roundHalfEven(15, 10), 2);
    assert.equal(roundHalfEven(3465, 10), 346);
    assert.equal(roundHalfEven(3475, 10), 348);
  });

  it('rounds below .5 down and above .5 up', () => {
    assert.equal(roundHalfEven(4999, 10_000), 0);
    assert.equal(roundHalfEven(5001, 10_000), 1);
  });

  it('keeps exact quotients unchanged', () => {
    assert.equal(roundHalfEven(20, 10), 2);
  });
});

describe('computeInvoice', () => {
  it('computes a single line', () => {
    // 1999 * 2 = 3998; 3998 * 8.25% = 329.835 -> 330
    assert.deepEqual(computeInvoice([{ productId: 'p-001', quantity: 2 }], catalog), {
      lines: [{ productId: 'p-001', quantity: 2, priceCents: 1999, lineTotal: 3998 }],
      subtotal: 3998,
      tax: 330,
      total: 4328,
    });
  });

  it('computes multiple lines', () => {
    // 2450 + 899 * 3 = 5147; 5147 * 8.25% = 424.6275 -> 425
    const invoice = computeInvoice([
      { productId: 'p-002', quantity: 1 },
      { productId: 'p-008', quantity: 3 },
    ], catalog);
    assert.equal(invoice.subtotal, 5147);
    assert.equal(invoice.tax, 425);
    assert.equal(invoice.total, 5572);
  });

  it('uses banker\'s rounding when tax lands exactly on half a cent', () => {
    // 4200 * 8.25% = 346.5 cents ($3.465) -> 346 (half to even)
    const invoice = computeInvoice([{ productId: 'p-006', quantity: 1 }], catalog);
    assert.equal(invoice.tax, 346);
    assert.equal(invoice.total, 4546);
  });

  it('rounds tax once per invoice, not per line', () => {
    // Per line: round(103.125) + round(214.4175) = 103 + 214 = 317.
    // Per invoice: round(3849 * 8.25%) = round(317.5425) = 318.
    const lines = [{ productId: 'p-005', quantity: 1 }, { productId: 'p-009', quantity: 1 }];
    const invoice = computeInvoice(lines, catalog);
    const perLineTax = invoice.lines
      .map((line) => roundHalfEven(line.lineTotal * TAX_RATE_BPS, BPS_PER_UNIT))
      .reduce((sum, tax) => sum + tax, 0);
    assert.equal(invoice.subtotal, 3849);
    assert.equal(invoice.tax, 318);
    assert.equal(invoice.total, 4167);
    assert.equal(perLineTax, 317);
  });
});

describe('POST /invoices', () => {
  it('responds 200 with the computed invoice', async () => {
    const res = await postInvoice({ lines: [{ productId: 'p-001', quantity: 1 }, { productId: 'p-006', quantity: 1 }] });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.subtotal, 6199);
    assert.equal(body.tax, 511);
    assert.equal(body.total, 6710);
  });

  it('responds 400 for an unknown productId', async () => {
    const res = await postInvoice({ lines: [{ productId: 'p-999', quantity: 1 }] });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_request');
  });

  it('responds 400 for a non-integer or zero quantity', async () => {
    for (const quantity of [1.5, 0, '2']) {
      const res = await postInvoice({ lines: [{ productId: 'p-001', quantity }] });
      assert.equal(res.status, 400);
      assert.equal((await res.json()).error, 'invalid_request');
    }
  });

  it('responds 400 for empty lines or malformed JSON', async () => {
    for (const body of [{ lines: [] }, '{"lines": [']) {
      const res = await postInvoice(body);
      assert.equal(res.status, 400);
      assert.equal((await res.json()).error, 'invalid_request');
    }
  });
});
