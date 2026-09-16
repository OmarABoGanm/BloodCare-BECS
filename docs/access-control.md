# Access-control matrix (implementation plan)
All application APIs except health and login require authentication. Existing endpoint URLs and operational payloads remain unchanged; anonymous access is intentionally removed.

| API / page | ADMIN | BLOOD_BANK_USER | RESEARCH_STUDENT |
|---|---|---|---|
| Operational dashboard, donations, requests, emergency | Full | Full | Denied |
| Inventory and compatibility | Read | Read | Safe read |
| Audit Trail, metadata, all Part 11 exports | Full | Denied | Denied |
| User administration | Full | Denied | Denied |
| Research summary / donations | Safe read | Safe read | Safe read |
| Auth me / logout | Own session | Own session | Own session |

Blood withdrawal is the existing Emergency confirmation workflow, not a new transfusion or fulfillment workflow. Research endpoints use allowlisted DTOs, omit IDs/free text, and generalize donation dates to years. Tests must authenticate protected requests; there is no legacy anonymous/security bypass.
