---
name: expense-workflows
description: Maintain income and expense workflows in a backend that implements them.
---

# Expense workflows

Use for expense or income creation, editing, deletion, or categorization when those features exist.

- Discover the application's transaction model, categories, account or wallet rules, and downstream summaries before changing a workflow.
- Preserve ownership, date semantics, amount validation, and any related balance or ledger effects across the full lifecycle. Do not assume a wallet, category API, or insufficient-funds rule exists.
- Test income and expense paths plus the changed failure case. Use transactions-and-integrity when one action updates multiple records.
