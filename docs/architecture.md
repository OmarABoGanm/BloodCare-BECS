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
