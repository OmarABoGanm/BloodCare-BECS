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
