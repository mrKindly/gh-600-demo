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
| `demo/issues/` | Ready-made issue texts: `03` is the one in the talk, `01` is a safe first run, `02` makes the agent reach for external docs (try the firewall) |
| `evals/` | 12 behavior checks for agent pull requests |

## Where each exam domain lives

| # | GH-600 domain | Files | What to try |
| --- | --- | --- | --- |
| 1 | Agent architecture and SDLC | [`AGENTS.md`](AGENTS.md), [`.github/copilot-instructions.md`](.github/copilot-instructions.md), [`.github/ISSUE_TEMPLATE/agent-task.yml`](.github/ISSUE_TEMPLATE/agent-task.yml) | Assign a vague issue and a scoped one, compare the pull requests |
| 2 | Tool use and environment | [`docs/mcp.md`](docs/mcp.md), [`docs/mcp-config.example.json`](docs/mcp-config.example.json) | Set `tools` to `"*"` and list what the agent can now call |
| 3 | Memory, state and execution | [`docs/agent-state/decisions.md`](docs/agent-state/decisions.md) | Start a fresh session and check it reads the log first |
| 4 | Evaluation and tuning | [`evals/`](evals/), [`.github/workflows/evals.yml`](.github/workflows/evals.yml) | Change one instruction line, rerun the same issue, compare the score |
| 5 | Multi-agent coordination | [`.github/agents/`](.github/agents/) | Compare the tool lists of the planner, implementer and reviewer |
| 6 | Guardrails and accountability | [`.github/CODEOWNERS`](.github/CODEOWNERS) plus a ruleset on `main` | Run issue `03`: the pull request cannot merge without the code owner |

## Reproduce the demo

1. Fork this repository. Enable Issues, Actions and the Copilot cloud agent (a paid Copilot plan is required).
2. Replace `@leifdeveloper` in [`.github/CODEOWNERS`](.github/CODEOWNERS) with a second account of yours, and add that account as a collaborator. It must not be the account that assigns the issue.
3. Create a branch ruleset for the default branch: empty bypass list, require a pull request with 1 approval and review from Code Owners, require the `test` status check. Rulesets are settings, so a fork does not copy them.
4. Create an issue from the **Agent task** template with the text of [`demo/issues/03-rounding-rule.md`](demo/issues/03-rounding-rule.md).
5. Assign the issue to Copilot. When the pull request opens, mark it ready for review, approve the workflow run and look at the merge box.

## License

[MIT](LICENSE)
