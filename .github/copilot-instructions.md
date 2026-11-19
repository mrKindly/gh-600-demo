# Copilot instructions

This repository is a demo for a talk about the GH-600 exam. The app is a small Node.js 22 service with zero dependencies.

## Before you start

- Read `AGENTS.md`. Its rules apply to every task.
- Read `docs/agent-state/decisions.md`. Do not redo work that is already decided there.

## How to work

- Keep the change scoped to the issue. Do not refactor unrelated code.
- Use only the Node.js standard library. Do not add dependencies or a lockfile.
- Every behavior change comes with a test in `tests/`, in the style of the existing `node:test` tests.
- If you change `app/api.js`, update `docs/api.md` in the same pull request.
- Run `npm test` before you finish.

## When you finish

- Add one entry to `docs/agent-state/decisions.md`: the decision, the reason, and what is left to do.
- In the pull request description, list what you changed and what you deliberately did not change.
