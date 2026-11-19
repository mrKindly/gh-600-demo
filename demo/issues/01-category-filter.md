# Add category filter to `GET /products`

## Problem

`GET /products?category=books` ignores the `category` parameter and returns all 9 products. Clients have to filter on their side.

## Expected behavior

- `GET /products?category=books` returns only products whose `category` is exactly `books`.
- `count` equals the number of returned items.
- Without the parameter, the endpoint behaves as today: all products, catalog order.
- A category with no matching products (for example `?category=toys`) returns `200 { "items": [], "count": 0 }`.
- Matching is exact and case-sensitive: categories are always lowercase.

## Acceptance criteria

- [ ] Filter implemented in `app/api.js` using the existing `URL` / `searchParams`.
- [ ] New tests in `tests/products.test.js`, one `describe` block, same style as existing tests.
- [ ] `docs/api.md` documents the `category` query parameter with an example.
- [ ] `npm test` passes. No new dependencies.
