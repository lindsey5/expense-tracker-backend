---
name: financial-calculations
description: Change monetary arithmetic or derived financial values in a backend that stores them.
---

# Financial calculations

Use when changing balances, totals, percentages, rates, or rounding in a financial feature.

- Identify the stored numeric type, currency units, rounding policy, and source of truth before calculating. Do not infer decimal precision or multi-currency support.
- Keep signed changes, reversals, date windows, and filters consistent across writes and reports. Use a defined zero-denominator behavior for percentages.
- Test fractional amounts, boundary thresholds, empty data, and reversals relevant to the actual product rule. Avoid changing storage representation without a migration plan.
