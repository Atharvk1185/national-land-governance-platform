# Security, Privacy & Compliance Architecture

## 1. Role-Based Access Control (RBAC) Matrix
The platform enforces role-based authorization across 8 distinct user tiers:

| Feature / Module | Super Admin | Govt Official | Researcher | Academic Inst | Industry Expert | Policy Analyst | Data Analyst | Public User |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| National Dashboard | Full | Full | Full | Full | Full | Full | Full | Read-Only |
| AI Research Search | Full | Full | Full | Full | Full | Full | Full | Full |
| AI Assistant | Full | Full | Full | Full | Full | Full | Full | Read-Only |
| GIS Explorer | Full | Full | Full | Full | Full | Full | Full | Public Layers |
| Policy Simulator | Full | Full | Full | Full | Full | Full | Full | Read-Only |
| Research Upload | Approve | Review | Create | Create | View | Create | View | View |
| Dataset Management | Full | Review | Reference | Reference | Reference | Reference | Analyze | View |
| Innovation Portal | Manage | Review | Submit | Submit | Submit | Submit | Submit | View |
| Admin Console | Full | View Logs | No Access | No Access | No Access | No Access | No Access | No Access |

## 2. PII Protection & Data Privacy
- **Cadastral Ownership Anonymization**: Individual landholder names, Aadhaar numbers, and phone records are strictly stripped from public spatial queries.
- **Judicial Records Masking**: Dispute records are aggregated at taluk and district levels; litigant identities are pseudonymized.

## 3. Threat Mitigation Controls
- **SQL / Query Injection Defense**: Parameterized queries enforced across all SQLite and PostgreSQL database drivers.
- **Cross-Site Scripting (XSS) Sanitization**: Strict HTML entity escaping for user submissions and research abstracts.
- **Tamper-Evident Audit Logging**: Every system modification, role elevation, and document ingestion is recorded in an immutable audit ledger.
