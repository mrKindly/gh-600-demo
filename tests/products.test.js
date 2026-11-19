import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from '../app/api.js';
import { getProductById, listProducts } from '../app/products.js';

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

describe('listProducts', () => {
  it('loads all 9 products from the catalog', () => {
    assert.equal(listProducts().length, 9);
  });
});

describe('getProductById', () => {
  it('returns the product for an existing id', () => {
    assert.equal(getProductById('p-001').name, 'Field Notes on Distributed Systems');
  });

  it('returns undefined for an unknown id', () => {
    assert.equal(getProductById('p-999'), undefined);
  });
});

describe('GET /health', () => {
  it('responds 200 with status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
    assert.deepEqual(await res.json(), { status: 'ok' });
  });
});

describe('GET /products', () => {
  it('responds 200 with all products in catalog order', async () => {
    const res = await fetch(`${baseUrl}/products`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.count, 9);
    assert.deepEqual(body.items.map((item) => item.id), listProducts().map((product) => product.id));
  });

  it('filters products by an exact category', async () => {
    const res = await fetch(`${baseUrl}/products?category=books`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.items.length > 0);
    assert.ok(body.items.every((item) => item.category === 'books'));
    assert.equal(body.count, body.items.length);
  });

  it('returns an empty list when no products match the category', async () => {
    const res = await fetch(`${baseUrl}/products?category=toys`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { items: [], count: 0 });
  });

  it('matches categories case-sensitively', async () => {
    const res = await fetch(`${baseUrl}/products?category=Books`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { items: [], count: 0 });
  });

  it('responds 405 for an unsupported method', async () => {
    const res = await fetch(`${baseUrl}/products`, { method: 'DELETE' });
    assert.equal(res.status, 405);
    assert.deepEqual(await res.json(), { error: 'method_not_allowed' });
  });
});

describe('GET /products/:id', () => {
  it('responds 200 with the product', async () => {
    const res = await fetch(`${baseUrl}/products/p-001`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), getProductById('p-001'));
  });

  it('responds 404 for an unknown id', async () => {
    const res = await fetch(`${baseUrl}/products/p-999`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'not_found' });
  });
});

describe('unknown path', () => {
  it('responds 404', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'not_found' });
  });
});
