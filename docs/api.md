# API

Base URL: `http://localhost:3000` (override with the `PORT` environment variable).

All responses use `Content-Type: application/json; charset=utf-8`. All money amounts are integer cents in `USD`.

## Common errors

| Status | Body | When |
| --- | --- | --- |
| `404` | `{ "error": "not_found" }` | Unknown path or unknown product id |
| `405` | `{ "error": "method_not_allowed" }` | Known path, unsupported method |
| `500` | `{ "error": "internal" }` | Unexpected server error (no stack trace is returned) |

## `GET /health`

Liveness check.

```sh
curl localhost:3000/health
```

```json
{ "status": "ok" }
```

## `GET /products`

Without a query parameter, returns every product in catalog order. The optional `category` query parameter filters the list by an exact, case-sensitive category.

```sh
curl localhost:3000/products
curl 'localhost:3000/products?category=books'
```

When no products match the category, the response contains an empty `items` array and a `count` of `0`.

```json
{
  "items": [
    { "id": "p-001", "name": "Field Notes on Distributed Systems", "category": "books", "priceCents": 1999, "currency": "USD", "inStock": true }
  ],
  "count": 9
}
```

The example is shortened to one item; the real response contains all 9.

## `GET /products/:id`

Returns one product.

```sh
curl localhost:3000/products/p-001
```

```json
{ "id": "p-001", "name": "Field Notes on Distributed Systems", "category": "books", "priceCents": 1999, "currency": "USD", "inStock": true }
```

An unknown id returns `404 { "error": "not_found" }`.

## `POST /invoices`

Computes an invoice. Tax is 8.25% of the subtotal, rounded once per invoice using banker's rounding (half to even): 346.5 cents becomes 346.

```sh
curl -X POST localhost:3000/invoices \
  -H 'Content-Type: application/json' \
  -d '{ "lines": [{ "productId": "p-001", "quantity": 1 }, { "productId": "p-006", "quantity": 1 }] }'
```

```json
{
  "lines": [
    { "productId": "p-001", "quantity": 1, "priceCents": 1999, "lineTotal": 1999 },
    { "productId": "p-006", "quantity": 1, "priceCents": 4200, "lineTotal": 4200 }
  ],
  "subtotal": 6199,
  "tax": 511,
  "total": 6710
}
```

The request is rejected with `400 { "error": "invalid_request", "message": "..." }` when:

- the body is not valid JSON;
- `lines` is missing or empty;
- a `productId` does not exist in the catalog;
- a `quantity` is not an integer or is less than 1.
