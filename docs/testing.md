# Testing

Automated tests cover every compatibility pair for all eight recipient types, derived donor recipients, invalid values, ranking behavior, API validation, endpoints, errors, and critical frontend interactions. API tests mock the persistence services and therefore cannot touch development or production data.

## Manual Test Plan

| ID | Scenario | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| T01 | A+ recipient | A+, 1 unit | A+, A-, O+, O- only | Pending | Not run |
| T02 | O- recipient | O- | O- only | Pending | Not run |
| T03 | O- donor | O- | All 8 recipients | Pending | Not run |
| T04 | Invalid blood type | A | Validation error | Pending | Not run |
| T05 | Negative donation | -1 | Rejected | Pending | Not run |
| T06 | Zero request | 0 | Rejected | Pending | Not run |
| T07 | Exact stock sufficient | A+, stock 10, need 2 | A+ ranked first | Pending | Not run |
| T08 | Exact stock low | A+, stock 1, need 2 | Insufficient warning | Pending | Not run |
| T09 | No compatible stock | all compatible 0 | Informative no-stock alert | Pending | Not run |
| T10 | Available donation | O+, 1 | Donation saved; O+ +1 | Pending | Not run |
| T11 | Quarantined donation | B+, 1 | Saved; inventory unchanged | Pending | Not run |
| T12 | Inventory states | 3/8/20 units | Critical/Low/Good text | Pending | Not run |
| T13 | Request filters | A+, urgent, matched | Only matching rows | Pending | Not run |
| T14 | API offline | stop server | Visible failure message | Pending | Not run |
| T15 | MongoDB offline | stop MongoDB | Health disconnected/startup failure documented | Pending | Not run |
| T16 | Mobile layout | 375px width | Usable cards/forms/navigation | Pending | Not run |
| T17 | Keyboard use | Tab/Space/Enter | Visible focus and operable selector | Pending | Not run |
| T18 | Unknown route | `/api/nope` | Consistent JSON 404 | Pending | Not run |

## Mass Casualty Emergency Tests

| ID | Scenario | Expected Result |
|---|---|---|
| E01 | Unknown types, enough O- | Policy allocation succeeds above reserve |
| E02 | Unknown types, insufficient O- | Exact shortage returned |
| E03 | O- reserve reached | Reserve protected and warning returned |
| E04 | Zero emergency inventory | Zero allocated and critical shortage |
| E05 | Request exceeds inventory | No projected or persisted negative stock |
| E06 | Request below inventory | Correct projected remainder |
| E07 | Casualties `0` or `-1` | Validation error |
| E08 | Invalid required units | Validation error |
| E09 | Partially known | Known uses compatibility engine; unknown uses policy |
| E10 | All known | Existing compatibility engine called |
| E11 | Simulation | Audit saved; inventory unchanged |
| E12 | Confirmation | Inventory updated transactionally |
| E13 | Double confirmation | Second attempt rejected; no second decrement |
| E14 | Inventory changes after simulation | Confirmation rejected as stale |
| E15 | O+ fallback disabled | No automatic O+ allocation to unknown recipients |

Manual UI checks: verify the emergency entry in desktop and collapsed mobile navigation; validate all three blood-type modes; simulate sufficient, low, and critical inventory; inspect warning text and before/after table; confirm only after the warning; open history detail; and verify Find Blood, Donation, Inventory, and Compatibility remain unchanged. Real emergency decisions still require qualified clinical and blood-bank review, testing/crossmatching when possible, and local procedures.

## Part 11 Manual Tests

| ID | Scenario | Expected Result |
|---|---|---|
| P11-01 | Register donation | `DONATION_CREATED` and donation-driven `INVENTORY_UPDATED` records appear |
| P11-02 | Create blood request | `BLOOD_REQUEST_CREATED` record appears |
| P11-03 | Confirm emergency allocation | Confirmation and per-type inventory audit records appear |
| P11-04 | Open Audit Trail | Actions display newest first with pagination |
| P11-05 | Filter by `DONATION_CREATED` | Only matching records display |
| P11-06 | Export BECS Metadata | Excel, PDF, and CSV download with current inventory snapshot and counts |
| P11-07 | Export Audit Trail | Excel, PDF, and CSV download with expected audit headers and records |
| P11-08 | Export filtered Audit Trail | Only action/entity/date-matching records are exported |
| P11-09 | Compare inventory before/after exports | No inventory value changes |
| P11-10 | Refresh Audit Trail after export | Corresponding export action appears |

Export verification: open `.xlsx` files in Excel and `.pdf` files in a PDF reader, confirm readable headers, values, page layout, and meaningful filenames. For CSV, confirm UTF-8 text, one header row, and readable quoted JSON values. Attempting PUT/PATCH/DELETE under `/api/audit/:id` must return 404 and leave the record unchanged.
