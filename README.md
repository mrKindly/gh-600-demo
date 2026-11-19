# gh600-agent-lab

Demo repository for a talk about the GitHub Copilot agent exam (GH-600). The app is intentionally boring: a tiny catalog and invoice microservice on plain Node.js, so the audience watches the agent, not the service.

Zero dependencies: Node.js 22 standard library only (`node:http`, `node:test`).

## Run

```sh
npm start        # http://localhost:3000, override with PORT=4000 npm start
npm test         # node --test, no npm install required
```

```sh
curl localhost:3000/products
curl -X POST localhost:3000/invoices -H 'Content-Type: application/json' \
  -d '{ "lines": [{ "productId": "p-001", "quantity": 1 }, { "productId": "p-006", "quantity": 1 }] }'
```

The full contract is in [`docs/api.md`](docs/api.md).

## Layout

| Path | Purpose |
| --- | --- |
| `app/products.js` | Loads `data/products.json` once, `listProducts()`, `getProductById()` |
| `app/api.js` | `createServer()`, routing, JSON responses, errors |
| `app/billing/` | Finance-critical tax and invoice math (integer cents) |
| `tests/` | Unit and HTTP tests on `node:test` |
| `demo/issues/` | Ready-made issue texts used in the demo clips |

## Branches

| Branch | Contents |
| --- | --- |
| `00-baseline` | The bare app, no agent configuration |
| `main` | `00-baseline` plus `AGENTS.md`, `.github/CODEOWNERS` and the agent task issue template |

## Reproduce the demo

1. Fork this repository. `main` holds the recording setup; `00-baseline` is the bare app.
2. Enable Issues, Actions and the Copilot coding agent in the fork settings.
3. Create an issue from the **Agent task** template with the text of [`demo/issues/03-rounding-rule.md`](demo/issues/03-rounding-rule.md).
4. Assign the issue to Copilot and watch the pull request it opens.

## License

[MIT](LICENSE)
