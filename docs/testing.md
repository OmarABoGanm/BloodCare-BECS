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
