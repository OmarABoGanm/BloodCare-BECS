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
- Helmet, restricted CORS, JSON size limits, validation, environment configuration, and no stored secrets

## Technology Stack
React 18, Vite, React Router, Axios, Bootstrap 5, Express, MongoDB/Mongoose, Jest/Supertest, Vitest/Testing Library, ESLint.

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
Run local MongoDB or create an Atlas database. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`. Atlas users should use the connection string supplied by Atlas and allow their current IP. Never commit `.env`.

## Environment Variables
- Server: `PORT`, `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV`
- Client: `VITE_API_BASE_URL`

## Running the Application
```bash
npm run seed
npm run dev
```
Open `http://localhost:5173`. The API defaults to `http://localhost:5000`.

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
The `/emergency` workflow models multi-casualty RBC inventory planning when recipient ABO/RhD types are unknown, partially known, or known. **Simulate Emergency Allocation** records a projected allocation without changing inventory. **Confirm Emergency Allocation** revalidates the inventory snapshot, then updates stock and the emergency audit record within a MongoDB transaction.

Unknown recipients follow the configurable academic policy in `server/config/emergencyBloodPolicy.js`. Its defaults prefer O-negative RBCs, protect a five-unit O-negative reserve, and disable automatic O-positive fallback. Known recipients are allocated by calling the existing authoritative compatibility engine. These values demonstrate inventory preservation and are not official medical rules. Confirmation uses a MongoDB transaction when replica-set support is available; standalone MongoDB uses an event lock, conditional inventory updates, and compensating rollback.

**BloodCare BECS is an academic software prototype. It is not validated or approved for clinical use and must not be used to make real transfusion decisions. Emergency transfusion policies vary by institution and require qualified clinical and blood-bank personnel.**

## Blood Compatibility Logic
`server/services/bloodCompatibilityService.js` is the sole authority for RBC ABO/RhD rules. The reverse donor-to-recipient view is derived from the recipient matrix.

## Priority Algorithm
Compatible types receive a deterministic score. A sufficient exact match gets the strongest preference; sufficient net inventory (available minus reserved) is next; inventory quantity helps; configured rarity and preservation costs reduce the score. Compatibility is filtered first and never traded for score. Scores support education only—not clinical selection.

## Demo Data
`npm run seed` creates missing inventory records with clearly labeled demo quantities. It uses `$setOnInsert` and does not overwrite existing records.

## Safety Disclaimer
Academic prototype – not for clinical decision-making. Real transfusion decisions require qualified clinical staff, verified product records, institution-specific emergency-release procedures, testing, and crossmatching when possible.

## Future Improvements
Authentication/RBAC, audit logging, transactional replica-set writes, component traceability, reservations/fulfillment, barcode support, validated local epidemiology, and formal clinical/regulatory validation.
