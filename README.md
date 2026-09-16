# BloodCare BECS

## Project Description
BloodCare BECS is a polished academic Blood Establishment Computer Software MVP for red blood cell compatibility, inventory-aware recommendations, donation registration, and request tracking.

## Academic Context
This system is educational and **not for clinical decision-making**. It never replaces crossmatching, antibody screening, laboratory procedures, physician judgment, or a hospital blood bank. Population and rarity values are configurable academic seed estimates and must be independently verified before any operational use.

## Features
- All eight ABO/RhD blood types with one authoritative compatibility matrix
- Deterministic donor ranking using exact match, net stock, sufficiency, rarity, and preservation weights
- Donation registration with inventory update for `AVAILABLE` donations
- Inventory status cards, compatibility education, and filtered request/donation histories
- Responsive, accessible React interface and consistent REST errors
- Two-stage mass-casualty emergency inventory simulation with auditable confirmation
- Append-only Part 11-inspired Audit Trail and metadata/audit exports in Excel, PDF, or CSV
- Helmet, restricted CORS, JSON size limits, validation, environment configuration, and no stored secrets

## Technology Stack
React 18, Vite, React Router, Axios, Bootstrap 5, Express, MongoDB/Mongoose, ExcelJS, PDFKit, Jest/Supertest, Vitest/Testing Library, ESLint.

## Architecture
The React client calls the Express REST API. Routes validate and delegate to controllers; controllers call services; services own compatibility, ranking, inventory, donation, and request behavior; Mongoose models persist records. See `docs/architecture.md`.

## Folder Structure
`client/` contains the React app and tests; `server/` contains API layers and tests; `docs/` contains architecture, API, and test documentation.

## Installation
```bash
cd BloodCare-BECS
npm install
npm run install:all
```

## MongoDB Configuration
Run local MongoDB or create an Atlas database. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`. Copy `client/.env.example` to `client/.env.local`. Do not overwrite existing environment files without checking your configuration. Atlas users should use the connection string supplied by Atlas and allow their current IP. Never commit personal environment files.

## Environment Variables
- Server: `PORT`, `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV`
- Client: `VITE_API_BASE_URL`

## Running the Application
```bash
npm run seed
npm run dev
```
Open `http://localhost:5174`. The local API is configured at `http://localhost:5051`.

### Windows / PowerShell

Use `npm.cmd` if PowerShell blocks the unsigned `npm.ps1` script. From the project folder, after creating the environment files above:

```powershell
npm.cmd install
npm.cmd run install:all
npm.cmd run seed
npm.cmd run dev
```

The development command opens the site automatically in your default external browser. Keep the terminal running; press `Ctrl+C` to stop. On Windows, the predev helper attempts to stop previous BloodCare development processes occupying ports 5051 or 5174. If another application owns either port, it stops startup and reports the conflict instead of terminating that application.

### Troubleshooting

- Ensure MongoDB is running and `MONGODB_URI` is correct before starting or seeding.
- Keep `PORT=5051`, `CLIENT_URL=http://localhost:5174`, and `VITE_API_BASE_URL=http://localhost:5051/api` consistent. Restart Vite after editing client environment variables.
- Check `http://localhost:5051/api/health` for API and database availability.
- Refresh with `Ctrl+F5` after updates. If Audit Trail loading fails, use **Try Again** after restoring the API connection. Empty optional date filters are ignored.
- Personal `.env` files, `node_modules`, generated downloads, and database records are not included in GitHub; install dependencies and configure MongoDB on each machine.

## Running Tests
```bash
npm test
npm run test:server
npm run test:client
npm run lint
npm run build
```

## API Overview
Health, compatibility, inventory, donations, and requests are under `/api`. See `docs/api.md`.

## Mass Casualty Emergency Mode
The `/emergency` workflow models multi-casualty RBC inventory planning when recipient ABO/RhD types are unknown, partially known, or known. **Simulate Emergency Allocation** records a projected allocation without changing inventory. **Confirm Emergency Allocation** revalidates the inventory snapshot, then updates stock and the emergency audit record using the persistence strategy described below.

Unknown recipients follow the configurable academic policy in `server/config/emergencyBloodPolicy.js`. Its defaults prefer O-negative RBCs, protect a five-unit O-negative reserve, and disable automatic O-positive fallback. Known recipients are allocated by calling the existing authoritative compatibility engine. These values demonstrate inventory preservation and are not official medical rules. Confirmation uses a MongoDB transaction when replica-set support is available; standalone MongoDB uses an event lock, conditional inventory updates, and compensating rollback.

**BloodCare BECS is an academic software prototype. It is not validated or approved for clinical use and must not be used to make real transfusion decisions. Emergency transfusion policies vary by institution and require qualified clinical and blood-bank personnel.**

## Part 11 Features

### Audit Trail
Important write operations append trace records with timestamp, action, entity, description, actor, previous/new values, and metadata. Covered actions include donations, donation-driven inventory updates, blood requests and status changes, emergency simulations and confirmations, emergency inventory changes, and both exports. The UI and API intentionally provide no edit or delete operation for audit records.

Open **Audit Trail** (`/audit`) to filter by action, entity type, or dates. Clicking **View** loads the selected record and smoothly scrolls to its details below the table, leaving space for the fixed navigation bar.

### Export BECS Metadata
The Part 11 page downloads a real Excel workbook (`.xlsx`), a formatted PDF report, or an Excel-friendly UTF-8 CSV containing application information, academic disclaimer, supported blood types, current inventory with status, donation/request/emergency/audit counts, and current system modules. Secrets, credentials, connection strings, and `.env` values are never included.

### Export Audit Trail
The Audit Trail can be exported as a styled Excel workbook, a paginated PDF report, or UTF-8 CSV with timestamp, action, entity type/ID, description, actor, old value, and new value. Server-side action, entity, and date filters are supported. Export generation is read-only for clinical/business data and appends an audit entry describing the export.

On **Part 11** (`/part11`), choose **Excel (.xlsx)**, **PDF (.pdf)**, or **CSV (.csv)** before clicking either download button. Excel is the default format. Downloads are generated in memory and do not modify blood inventory.

### Academic Scope
These features demonstrate Part 11-inspired traceability for academic purposes. BloodCare BECS is not validated, certified, or represented as compliant with FDA 21 CFR Part 11 or any production regulatory standard.

## Blood Compatibility Logic
`server/services/bloodCompatibilityService.js` is the sole authority for RBC ABO/RhD rules. The reverse donor-to-recipient view is derived from the recipient matrix.

## Priority Algorithm
Compatible types receive a deterministic score. A sufficient exact match gets the strongest preference; sufficient net inventory (available minus reserved) is next; inventory quantity helps; configured rarity and preservation costs reduce the score. Compatibility is filtered first and never traded for score. Scores support education only—not clinical selection.

## Demo Data
`npm run seed` creates missing inventory records with clearly labeled demo quantities. It uses `$setOnInsert` and does not overwrite existing records.

## Safety Disclaimer
Academic prototype – not for clinical decision-making. Real transfusion decisions require qualified clinical staff, verified product records, institution-specific emergency-release procedures, testing, and crossmatching when possible.

## Future Improvements
Authentication/RBAC, stronger audit integrity controls, component traceability, reservations/fulfillment, barcode support, validated local epidemiology, and formal clinical/regulatory validation.
