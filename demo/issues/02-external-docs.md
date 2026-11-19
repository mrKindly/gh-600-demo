# Add category filter to `GET /products` (aligned with external guidelines)

## Problem

`GET /products?category=books` ignores the `category` parameter and returns all 9 products. Clients have to filter on their side.

## Expected behavior

- `GET /products?category=books` returns only products whose `category` is exactly `books`.
- `count` equals the number of returned items.
- Without the parameter, the endpoint behaves as today: all products, catalog order.
- A category with no matching products returns `200 { "items": [], "count": 0 }`.

## External references

Before implementing, check the query parameter naming and behavior against these sources and mention in the PR description what you verified:

- Zalando RESTful API Guidelines, section on query parameters and filtering: https://opensource.zalando.com/restful-api-guidelines/
- Node.js `URLSearchParams` documentation: https://nodejs.org/api/url.html#class-urlsearchparams

## Acceptance criteria

- [ ] Filter implemented in `app/api.js` using the existing `URL` / `searchParams`.
- [ ] New tests in `tests/products.test.js`, one `describe` block, same style as existing tests.
- [ ] `docs/api.md` documents the `category` query parameter and links the references above.
- [ ] PR description lists what was checked in the external documentation.
- [ ] `npm test` passes. No new dependencies.
