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

Common responses: `400` invalid type/units/body/id, `404` missing resource/route, `500` database or internal error. Production `500` responses do not expose stack traces.
