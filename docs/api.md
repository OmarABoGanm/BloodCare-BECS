# REST API

All errors use `{ "success": false, "message": "...", "errors": [] }`.

| Method | Endpoint | Parameters/body | Success |
|---|---|---|---|
| GET | `/api/health` | none | Application and database status |
| GET | `/api/compatibility/recipient/:bloodType` | path type; optional `units` query | Compatible donors, ranked options, inventory |
| GET | `/api/compatibility/donor/:bloodType` | path type | Compatible recipients |
| GET | `/api/inventory` | none | All inventory records |
| GET | `/api/inventory/:bloodType` | path type | One inventory record |
| POST | `/api/donations` | `donorName`, `bloodType`, positive `unitsDonated`; optional `donorReference`, `donationDate`, `status`, `notes` | Donation and updated inventory (`201`) |
| GET | `/api/donations` | none | Newest donations first |
| POST | `/api/requests` | `patientReference`, `requiredBloodType`, positive `unitsRequired`, `urgency`; optional `notes` | Saved request with recommendations (`201`) |
| GET | `/api/requests` | optional `requiredBloodType`, `urgency`, `status` | Filtered request history |
| GET | `/api/requests/:id` | MongoDB id | One request |
| POST | `/api/emergency/simulate` | Emergency event body | Saved simulation and projected allocation; inventory unchanged (`201`) |
| POST | `/api/emergency/confirm` | `simulationId` | Confirmed audit record and atomically updated inventory |
| GET | `/api/emergency` | none | Emergency history, newest first |
| GET | `/api/emergency/:id` | MongoDB id | One emergency event with allocation details |
| PATCH | `/api/requests/:id/status` | `status`: `OPEN`, `MATCHED`, `FULFILLED`, or `CANCELLED` | Updated request and audit entry |
| GET | `/api/audit` | optional filters/pagination | Audit records newest first |
| GET | `/api/audit/:id` | MongoDB id | One audit record |
| GET | `/api/exports/becs-metadata` | `format=csv\|xlsx\|pdf` | Download BECS metadata |
| GET | `/api/exports/audit-trail` | `format=csv\|xlsx\|pdf`; optional audit filters | Download Audit Trail |

Common responses: `400` invalid type/units/body/id, `404` missing resource/route, `500` database or internal error. Production `500` responses do not expose stack traces.

## Emergency API

### Simulate

`POST /api/emergency/simulate`

Required body fields are `eventName`, positive integer `numberOfCasualties`, `bloodTypeStatus` (`ALL_UNKNOWN`, `PARTIALLY_KNOWN`, or `ALL_KNOWN`), positive integer `estimatedUnitsRequired`, and `severity` (`URGENT`, `CRITICAL`, or `MASS_CASUALTY`). `casualtyData` contains `{ casualtyNumber, bloodType }` entries where blood type is an ABO/RhD value or `UNKNOWN`; `notes` is optional. Partially known events require at least one known and one unknown casualty; all-known events require a valid type for each casualty.

The response uses the normal `{ success, message, data }` envelope. `data` includes the event, per-type allocation with before/allocated/after quantities, totals, shortage, `allocationStatus`, workflow `status`, warnings, inventory snapshot, and academic disclaimer. No inventory value changes.

### Confirm

`POST /api/emergency/confirm` with `{ "simulationId": "<MongoDB id>" }` re-reads inventory and confirms only an unchanged `SIMULATED` event. It returns `409` for duplicate confirmation or stale inventory, `404` for a missing event, and `400` for an invalid ID. Replica sets use transactions; standalone MongoDB uses a confirmation lock, conditional decrements, and compensating rollback.

### History and detail

`GET /api/emergency` returns newest events first. `GET /api/emergency/:id` returns full audit and allocation detail, `400` for an invalid ID, or `404` when absent.

## Audit Trail API

### List records

`GET /api/audit` supports `action`, `entityType`, `startDate`, `endDate`, `page` (default 1), and `limit` (default 25, maximum 100). Dates use ISO 8601. The standard response `data` contains `{ items, pagination }`, with items sorted by timestamp newest first. Invalid dates or pagination return `400`.

Example: `GET /api/audit?action=DONATION_CREATED&entityType=DONATION&startDate=2026-01-01&page=1&limit=25`.

### One record

`GET /api/audit/:id` returns one record in the standard JSON envelope. Invalid IDs return `400`; absent records return `404`. No POST, PATCH, PUT, or DELETE audit endpoints exist.

## Export API

### BECS metadata

`GET /api/exports/becs-metadata?format=xlsx` accepts `xlsx`, `pdf`, or `csv` and returns the matching attachment content type and extension. It contains system information, supported types, current inventory/status, database counts, and module names. It excludes environment values and credentials. Unsupported formats return `400`; server/database failures return `500`.

### Audit Trail

`GET /api/exports/audit-trail?format=xlsx` accepts `xlsx`, `pdf`, or `csv` and supports `action`, `entityType`, `startDate`, and `endDate`. The attachment contains `Timestamp, Action, Entity Type, Entity ID, Description, Performed By, Old Value, New Value`. Excel files include styled columns and filters, PDF files are formatted and paginated, and CSV values are escaped with a UTF-8 BOM. The export itself creates an `AUDIT_TRAIL_EXPORTED` record after selecting rows.
