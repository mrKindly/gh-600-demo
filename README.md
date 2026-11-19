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

## Branch map

Every branch builds on the previous one and changes only `.github/`, `AGENTS.md`, `docs/`, `eval/` and repository settings, never the application code.

| Branch | Exam domain | Diff |
| --- | --- | --- |
| `00-baseline` | Starting point, no agent configuration | — |
| `01-architecture` | Agent architecture: instructions and custom agents | [compare](../../compare/00-baseline...01-architecture) |
| `02-tools` | Tools and MCP | [compare](../../compare/01-architecture...02-tools) |
| `03-memory` | Memory and context | [compare](../../compare/02-tools...03-memory) |
| `04-evaluation` | Evaluation | [compare](../../compare/03-memory...04-evaluation) |
| `05-orchestration` | Orchestration of multiple agents | [compare](../../compare/04-evaluation...05-orchestration) |
| `06-guardrails` | Guardrails: code owners, rulesets, required checks | [compare](../../compare/05-orchestration...06-guardrails) |

Branches 01–06 are for reading and trying out; they are never merged into `main`.

## Reproduce the demo

1. Fork this repository. `main` holds the recording setup (`00-baseline` plus `AGENTS.md`, `CODEOWNERS` and the issue template); `00-baseline` is the bare app.
2. Enable Issues, Actions and the Copilot coding agent in the fork settings.
3. Create an issue from a file in [`demo/issues/`](demo/issues/), for example `01-category-filter.md`.
4. Assign the issue to Copilot and watch the pull request it opens.
5. Check out the next branch and repeat to see how each configuration layer changes the result.

## License

[MIT](LICENSE)
