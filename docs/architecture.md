# Architecture

```text
React Frontend
      |
      v
Express REST API
      |
      v
Routes -> Validation -> Controllers
                         |
                         v
                      Services
                         +--> Blood Compatibility Engine
                         |
                         v
                      Mongoose
                         |
                         v
                       MongoDB
```

The client renders workflows and consumes results without duplicating medical rules. Routes define URLs and validation. Controllers translate HTTP requests and responses. Services hold business processes and the authoritative compatibility/ranking engine. Models enforce persistence constraints. Central middleware normalizes validation, missing-resource, and server errors.

Inventory updates use atomic `$inc`. Donation creation and inventory update are sequential in this portable MVP; production deployments should run a MongoDB replica set and wrap both operations in a Mongoose transaction.

## Mass Casualty Emergency

```text
Emergency Page
      |
      v
Emergency API
      |
      v
Emergency Controller
      |
      v
Emergency Allocation Service
      |
      +------> Existing Blood Compatibility Service
      |
      +------> Emergency Policy
      |
      v
Blood Inventory
      |
      v
MongoDB
```

The emergency service coordinates multiple simulated RBC needs. Known recipients call the existing blood compatibility service, preserving one authoritative ABO/RhD implementation. Unknown recipients use the separate academic emergency policy. Simulation stores an audit record and a complete inventory snapshot without decrementing stock. Confirmation rejects stale snapshots and previously confirmed events and uses conditional decrements to prevent negative inventory. Replica sets use a MongoDB transaction; standalone servers use an atomic event lock plus compensating rollback if any conditional update fails.

## Part 11 Traceability

```text
Existing System Action
        |
        v
Controller / Service
        |
        v
Database Change
        |
        v
Audit Service
        |
        v
AuditLog Collection
```

`auditService` centralizes action names, append-only creation, filtering, pagination, and newest-first retrieval. The application exposes GET-only Audit Trail routes; no update or delete API/UI exists. Existing business services append audit records after their write succeeds, without changing compatibility behavior.

```text
Part 11 UI
        |
        v
Export API
        |
        +----> BECS Metadata Service
        |
        +----> Audit Export Service
        |
        v
CSV / Excel / PDF File Download
```

Exports are generated in memory and streamed with download headers. They do not create stored files and are read-only for inventory and business records; the only export-side database write is the corresponding AuditLog entry.
