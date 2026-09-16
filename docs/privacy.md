# HIPAA-oriented privacy and access control

This project demonstrates HIPAA-inspired privacy and access-control principles for academic purposes. It is not a certified or validated HIPAA-compliant production healthcare system.

## Actual protected data

| Model / field | Classification | ADMIN / BLOOD_BANK_USER | Research response |
|---|---|---|---|
| Donation.donorName, donorReference | Direct / linkable donor identity | Operational access | Never returned |
| Donation.notes | Free text may contain health/identity/care/payment data | Operational access | Never returned |
| Donation.bloodType, unitsDonated, status | Health / operational data | Operational access | Allowlisted, without identity |
| Donation.donationDate | Care-related date | Exact operational date | Year only |
| Donation._id, timestamps | Linkability / exact dates | Operational access | Never returned |
| BloodRequest.patientReference, notes | Patient identity / potentially health/care data | Operational access | Request API denied entirely |
| BloodRequest.recommendations, requestDate, status | Care and request details | Operational access | Request API denied entirely |
| EmergencyEvent.eventName, notes, casualtyData, timestamps | Potential identifying context / care data | Operational access | Emergency API denied entirely |
| BloodInventory.bloodType, unitsAvailable, reservedUnits | Aggregate stock | Read | Allowlisted safe inventory |
| BloodInventory._id, lastUpdated | Internal identifiers / exact update time | Operational access | Omitted |
| AuditLog.description, actor, old/new values, metadata | May contain operational and user-identifiable data | ADMIN only | Audit and export APIs denied |
| User.username, fullName, email, role | Private application-account identity | ADMIN manages; each user reads own profile | Only own authenticated profile, never donor/patient identity |
| User.passwordHash | Authentication secret | Never returned | Never returned |
| AuthSession.tokenHash | Hashed session credential | Never returned | Never returned |

Address, birth date, personal ID/SIN, donor email and phone are not fields in the existing Donation/BloodRequest models. They are not added for this extension. If they appear in free-text notes they are treated as protected, not research data. Physical/mental health, provided care, and identifying payment/care information are protected whenever present in these fields.

## Roles and authorization

See [access-control.md](access-control.md) for the complete access matrix. Authentication middleware precedes route authorization on all existing business API mounts. ADMIN alone can administer users, read Audit Trail, and export metadata/audit data. BLOOD_BANK_USER retains donation deposit, requests, compatibility, inventory and Emergency confirmation. Actual stock withdrawal uses existing Emergency confirmation; setting a blood request to FULFILLED only changes its status, as before.

RESEARCH_STUDENT can read compatibility, safe inventory, and dedicated research endpoints, but cannot read operational donation/request/emergency endpoints, even with a guessed ID or query parameter. Navigation and reusable frontend guards mirror these permissions; they are not relied upon for backend security.

## Authentication and passwords

The server creates a cryptographically random 256-bit opaque token. Only its SHA-256 hash is stored in MongoDB AuthSession. The browser receives an HttpOnly, SameSite=Strict cookie scoped to /api; Secure is enabled in production. No token is placed in localStorage, JavaScript-visible cookies, URLs, or exports. No JWT signing secret or AUTH_SECRET is required for this architecture.

Sessions expire after eight hours. Expiration is checked on each request, independently of eventual MongoDB TTL cleanup. Each request fetches the current User and checks active status. Logout deletes the session; password resets, role changes and status changes revoke that user's sessions. The frontend reacts to 401 responses by removing authenticated state and redirecting protected pages to login.

Passwords are hashed with bcryptjs, cost 12, and must have 8–72 characters, uppercase, lowercase and a digit, with a maximum of 72 UTF-8 bytes to avoid bcrypt truncation. Login errors are generic. A per-process/IP limiter allows at most 30 login attempts in 15 minutes; production multi-instance deployments require a shared limiter and correctly configured trusted proxy.

All state-changing browser requests need X-BloodCare-Request: 1; unexpected Origin values are rejected. Credentialed CORS accepts only CLIENT_URL. Production requires HTTPS and same-site frontend/API deployment. Missing/expired credentials return 401 and disallowed roles return 403.

## Central de-identification

deidentificationService builds explicit response objects rather than deleting a short list of forbidden fields. Research donations include ONLY bloodType, unitsDonated, status and donationYear. Research inventory includes ONLY bloodType, unitsAvailable and reservedUnits. The MongoDB research projection also excludes identifiers before DTO construction. Queries cannot expand the selected fields, access PHI, or change the authenticated role. Pagination is bounded to 100 records.

Research summary groups by blood type and provides counts/units only. Exact dates, record IDs, donor references, names and notes are absent. Small groups and rare combinations may still permit inference; this is a teaching example, not a formal HIPAA Safe Harbor or expert-determination de-identification process. Do not upload real PHI.

## User administration

No public registration endpoint exists. The initial administrator is created by seed:admin using manually configured environment credentials, never a hardcoded password. The seed refuses duplicate/overwriting creation if an active admin exists. Administrators create accounts, change profile/role/status and reset passwords. Unknown roles are rejected. Writes affecting admin membership are serialized with a MongoDB lease lock and cannot remove the last active admin.

## Part 11 and exports

Existing event names and historical performedBy strings remain readable. New events add performedByUserId, performedByUsername and performedByRole through request-local AsyncLocalStorage context. Concurrent requests do not share actors.

New events: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, USER_CREATED, USER_ROLE_CHANGED, USER_ACTIVATED, USER_DEACTIVATED, USER_PASSWORD_RESET, ACCESS_DENIED. Attempted passwords are never recorded. User administration audit payloads contain only necessary role/status/username information, not password hashes or personal profile fields.

AuditService recursively removes security-key fields from new audit payloads and from historical API/export responses. Password/hash/session/cookie/token/signing/database-credential fields are excluded. Audit exports append actor ID, username and role columns while retaining the original columns. Metadata remains aggregate and never queries User hashes or AuthSession records. Excel, PDF and CSV remain available to ADMIN only.

## Production limitations

This extension is not a compliance certification. It does not implement MFA, organizational identity proofing, encryption-at-rest/key management, tamper-evident audit storage, backup/disaster recovery, monitoring, retention policies, a distributed login limiter, legal agreements, or a clinical approval process. Store only academic/demo data. Configure MongoDB access controls, network restrictions, TLS and operational safeguards before any separately validated deployment.
