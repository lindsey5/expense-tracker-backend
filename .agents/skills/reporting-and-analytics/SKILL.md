---
name: reporting-and-analytics
description: Maintain implemented backend reports and aggregates without inventing new metrics.
---

# Reporting and analytics

Use for a report, dashboard data endpoint, or aggregate that the application actually supports.

- Locate the source records, metric definition, filters, grouping, time zone, and public response shape before changing a result.
- Apply the same access scope and date boundaries to rows, counts, totals, and comparisons. Distinguish missing data from zero according to the existing contract.
- Test empty data, boundary periods, and representative groups. Do not claim charts, exports, or scheduled reports exist unless the repository implements them.
