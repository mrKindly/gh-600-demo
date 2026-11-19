# Decisions log

Durable memory for agents and humans. A new session reads this file first and does not redo what is decided here.

One entry per task, newest first, three lines each:

```text
Decision:  what was decided
Reason:    why
Next:      what is left to do, or "nothing"
```

## Product category filtering

```text
Decision:  filter GET /products by an exact category query value when provided
Reason:    clients can request category-specific products while unfiltered responses preserve catalog order
Next:      nothing
```

## Money is stored as integer cents

```text
Decision:  all amounts are integer cents; no floating point in app/billing/
Reason:    floats lose cents on tax math (0.1 + 0.2 !== 0.3)
Next:      nothing
```

## Tax is rounded once per invoice

```text
Decision:  tax is computed on the subtotal and rounded once, not per line
Reason:    per-line rounding drifts by a cent on multi-line invoices
Next:      nothing
```
