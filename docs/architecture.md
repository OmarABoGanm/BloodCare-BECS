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

## Authentication and privacy extension

```text
User -> Login -> Authentication Service -> opaque HttpOnly cookie
                      |
                      v
              AuthSession token hash / expiry in MongoDB
                      |
                      v
requireAuth (session + current active User) -> requireRole
                      |
                      v
                Protected Controller
                      +--> Existing operational service
                      +--> Request-local actor -> Audit Trail
```

Bcryptjs hashes User passwords (cost 12); API DTOs and Mongoose serialization never expose passwordHash. Server-side sessions have explicit expiry checks and MongoDB TTL cleanup. Cookie flags are HttpOnly/SameSite=Strict and Secure in production. Mutation headers plus strict Origin/CORS checking protect browser requests against CSRF. ADMIN-only routes validate user changes and serialize last-admin-affecting writes using a MongoDB lease lock.

AsyncLocalStorage supplies actor context to existing auditService calls without changing the compatibility, donation, request or Emergency service signatures. Historical audit records require no destructive migration. Security audit payloads are minimal and recursively sanitized; actor columns are added to existing export formats.

```text
RESEARCH_STUDENT -> Protected Research API -> Authorization
                                              |
                                              v
                                 Allowlisted MongoDB projection
                                              |
                                              v
                                  De-identification Service
                                              |
                                              v
                           Blood type / units / status / year only
```

Research summary performs blood-type aggregation without returning donors. Inventory responses for researchers omit identifiers/update dates. Identifiable operational endpoints remain denied rather than exposing rows and hiding fields in React. React AuthProvider uses /auth/me, reusable ProtectedRoute guards, role-aware navigation, login/logout and 401-expiry handling. No authentication token is saved to localStorage.
