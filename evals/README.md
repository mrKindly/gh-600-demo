# Evals

Twelve behavior checks for agent pull requests. They do not judge whether the code looks nice. They check whether the agent followed the rules: tests pass, the protected folder is untouched, no dependencies, every code change has a test and a decision entry.

Run locally against `main`:

```sh
node evals/run.js main
```

In CI the [Evals workflow](../.github/workflows/evals.yml) runs on every pull request and writes the score to the job summary. The threshold is 10 of 12 (`EVAL_THRESHOLD`).

## Try it

1. Change one line in `.github/copilot-instructions.md`, for example delete the line about `docs/agent-state/decisions.md`.
2. Give the agent the same issue again.
3. Compare the score: case E08 is the first to fail.

Change one thing at a time. If you change the model, the instructions and the tool list together, the score moves and you learn nothing.
