# ExpenseFlow Enterprise — Profile Module: Field Specification

Design-only document. No API or frontend code included — field list, data types, and rules only.

---

## 1. Personal Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Profile Image | String (URL) | No | System avatar placeholder | Yes | Employee, Manager, Org Admin | Max 5MB; JPG/PNG/WebP only; min 200x200px | User's profile picture, stored via Cloudinary/S3. |
| Full Name | String | Yes | — | Yes | Employee, Manager, Org Admin | Min 3, Max 100 chars; letters, spaces, hyphens, apostrophes only | Employee's legal display name. |
| Preferred Name | String | No | Same as Full Name | Yes | Employee, Manager, Org Admin | Max 50 chars | Name shown in UI/greetings if different from legal name. |
| Email (Personal) | String (Email) | Yes | — | Yes (with re-verification) | Employee, Manager, Org Admin | Valid email regex; unique across system | Primary login/contact email. |
| Phone Number | String | Yes | — | Yes | Employee, Manager, Org Admin | E.164 format; 10–15 digits with country code | Mobile number for OTP/2FA and notifications. |
| Alternate Phone Number | String | No | null | Yes | Employee, Manager, Org Admin | E.164 format | Secondary contact number. |
| Date of Birth | Date | No | null | Yes | Employee, Org Admin | Must be 18+ years old; ISO 8601 format | Used for age verification and birthday notifications. |
| Gender | Enum (Male/Female/Other/Prefer not to say) | No | "Prefer not to say" | Yes | Employee, Org Admin | Must match enum list | Optional demographic field. |
| Nationality | String | No | null | Yes | Org Admin | ISO 3166 country list | For compliance/tax residency purposes. |
| Address Line 1 | String | No | null | Yes | Employee, Org Admin | Max 200 chars | Residential address. |
| Address Line 2 | String | No | null | Yes | Employee, Org Admin | Max 200 chars | Apartment/suite/unit. |
| City | String | No | null | Yes | Employee, Org Admin | Max 100 chars | City of residence. |
| State/Province | String | No | null | Yes | Employee, Org Admin | Max 100 chars | State/province. |
| Country | String | No | null | Yes | Employee, Org Admin | ISO 3166 country code | Country of residence. |
| Postal/ZIP Code | String | No | null | Yes | Employee, Org Admin | Regex per country format | Postal code. |
| Emergency Contact Name | String | No | null | Yes | Org Admin | Max 100 chars | Name of emergency contact. |
| Emergency Contact Phone | String | No | null | Yes | Org Admin | E.164 format | Emergency contact number. |

---

## 2. Professional Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Employee ID | String | Yes | Auto-generated (e.g., EMP-00231) | No | Employee, Manager, Org Admin | System-generated, unique, immutable | Unique internal employee identifier. |
| Designation / Job Title | String | Yes | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Max 100 chars | Employee's job title (e.g., "Senior Accountant"). |
| Department | String / ObjectId Ref | Yes | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match existing Department record | Department the employee belongs to. |
| Sub-Department / Team | String / ObjectId Ref | No | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match existing Team record | Team within the department. |
| Branch / Office Location | String / ObjectId Ref | No | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match existing Branch record | Physical office/branch assignment. |
| Reporting Manager | ObjectId Ref (User) | Yes | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Must reference valid active user; cannot self-reference | Direct manager for approvals and org chart. |
| Secondary Approver / Skip-Level | ObjectId Ref (User) | No | null | Yes (Org Admin only) | Manager, Org Admin | Must reference valid active user | Backup approver when primary manager is unavailable. |
| Joining Date | Date | Yes | null | Yes (Org Admin only) | Employee, Manager, Org Admin | Cannot be a future date beyond onboarding window | Date of joining the organization. |
| Probation End Date | Date | No | Joining Date + policy default | Yes (Org Admin only) | Manager, Org Admin | Must be after Joining Date | End of probation period. |
| Employment Status | Enum (Active/On Leave/Suspended/Terminated) | Yes | "Active" | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match enum list | Current employment state. |
| Work Location Type | Enum (Onsite/Remote/Hybrid) | No | "Onsite" | Yes | Employee, Manager, Org Admin | Must match enum list | Work arrangement type. |
| Grade / Job Level | String | No | null | Yes (Org Admin only) | Manager, Org Admin | Max 50 chars | Internal seniority/pay grade band. |
| Cost Center | String / ObjectId Ref | No | null | Yes (Org Admin only) | Manager, Org Admin | Must match existing Cost Center record | Used for expense allocation and budgeting. |

---

## 3. Organization Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Organization Name | String | Yes | — | No | Employee, Manager, Org Admin | Inherited from tenant record | Name of the tenant organization. |
| Organization ID | ObjectId Ref | Yes | Auto-generated | No | Employee, Manager, Org Admin | System-generated UUID | Unique tenant identifier (multi-tenancy key). |
| Role | Enum (Employee/Manager/Finance/Org Admin/Super Admin) | Yes | "Employee" | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match RBAC role list | Determines system permissions. |
| Sub-Roles / Permission Groups | Array of String | No | [] | Yes (Org Admin only) | Org Admin | Must match existing permission group IDs | Granular permission overrides beyond base role. |
| Employment Type | Enum (Full-Time/Part-Time/Contract/Intern/Consultant) | Yes | "Full-Time" | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match enum list | Nature of employment contract. |
| Business Unit | String / ObjectId Ref | No | null | Yes (Org Admin only) | Manager, Org Admin | Must match existing Business Unit record | Larger org grouping above department. |
| Legal Entity | String / ObjectId Ref | No | null | Yes (Org Admin only) | Org Admin | Must match existing Legal Entity record | For multi-entity/multi-country organizations. |
| Tenant Plan / License Tier | Enum (Free/Pro/Enterprise) | Yes | Inherited from org | No | Org Admin | System-managed | Subscription tier controlling feature access. |

---

## 4. Account Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Username | String | No | Derived from email | Yes (Org Admin only) | Employee, Manager, Org Admin | Unique, 4–30 chars, alphanumeric + underscore | Optional login alias if not using email. |
| Account Status | Enum (Active/Inactive/Pending/Suspended/Deactivated) | Yes | "Pending" | Yes (Org Admin only) | Employee, Manager, Org Admin | Must match enum list | Current account lifecycle state. |
| Email Verification Status | Boolean | Yes | false | No (system-set) | Employee, Manager, Org Admin | true/false only | Whether primary email is verified. |
| Phone Verification Status | Boolean | Yes | false | No (system-set) | Employee, Manager, Org Admin | true/false only | Whether phone number is verified. |
| Two-Factor Authentication Status | Boolean | Yes | false | Yes | Employee, Org Admin | true/false only | Whether 2FA/MFA is enabled. |
| Two-Factor Method | Enum (SMS/Authenticator App/Email) | No | null | Yes | Employee | Required if 2FA Status = true | Selected 2FA delivery method. |
| Last Login At | DateTime | No | null | No (system-set) | Employee, Org Admin | ISO 8601 timestamp | Timestamp of most recent login. |
| Last Login IP | String | No | null | No (system-set) | Org Admin | Valid IPv4/IPv6 | IP address of last login for audit. |
| Failed Login Attempts | Number | Yes | 0 | No (system-set) | Org Admin | Non-negative integer; resets on success | Tracks brute-force attempts for lockout policy. |
| Account Locked | Boolean | Yes | false | No (system-set) | Org Admin | true/false only | Auto-set true after threshold of failed logins. |
| Created Date | DateTime | Yes | Auto-set on creation | No | Employee, Manager, Org Admin | ISO 8601 timestamp, immutable | Record creation timestamp. |
| Updated Date | DateTime | Yes | Auto-set on update | No (system-set) | Employee, Manager, Org Admin | ISO 8601 timestamp | Last profile modification timestamp. |
| Deactivated Date | DateTime | No | null | No (system-set) | Org Admin | ISO 8601 timestamp | Date the account was deactivated, if applicable. |
| Deactivation Reason | String | No | null | Yes (Org Admin only) | Org Admin | Max 250 chars | Reason logged for offboarding/audit. |

---

## 5. Security Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Password Hash | String (hashed) | Yes | — | No (never exposed) | — (backend only) | bcrypt/argon2 hashed, never returned in API responses | Securely stored password hash. |
| Password Changed At | DateTime | No | null | No (system-set) | Employee, Org Admin | ISO 8601 timestamp | Tracks last password change for policy enforcement. |
| Password Expiry Date | DateTime | No | null | No (system-set) | Org Admin | Based on org password policy | Forces reset after policy-defined interval. |
| Security Questions | Array of Object | No | [] | Yes | Employee | Min 2 questions if enabled | Fallback identity verification. |
| Active Sessions | Array of Object (sessionId, device, IP, loginAt) | No | [] | No (system-managed) | Employee, Org Admin | Read-only, revocable | List of currently active login sessions. |
| Login Devices | Array of Object (deviceId, deviceName, os, browser, lastUsed) | No | [] | No (system-managed) | Employee, Org Admin | Read-only | Trusted/known devices used to log in. |
| Trusted Device Flag | Boolean (per device) | No | false | Yes | Employee | true/false only | Marks a device to skip repeated 2FA challenges. |
| API Access Tokens | Array of Object (tokenId, scope, createdAt, expiresAt) | No | [] | Yes (create/revoke only) | Employee, Org Admin | Token value never displayed after creation | Personal access tokens for integrations. |
| Recovery Email | String (Email) | No | null | Yes | Employee | Valid email format; must differ from primary email | Backup email for account recovery. |
| Security Audit Log Reference | ObjectId Ref (Array) | No | [] | No (system-managed) | Org Admin | Read-only | Links to audit log entries for this profile. |

---

## 6. Preferences

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Language | Enum (en, hi, es, fr, de, ...) | Yes | "en" | Yes | Employee | Must match supported language list | UI display language. |
| Time Zone | String (IANA TZ) | Yes | Org default TZ | Yes | Employee | Must be valid IANA timezone string | Used for timestamps and reminders. |
| Currency | String (ISO 4217) | Yes | Org default currency | Yes | Employee | Must match ISO 4217 code | Default currency for expense entry/display. |
| Date Format | Enum (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD) | No | "DD/MM/YYYY" | Yes | Employee | Must match enum list | Preferred date display format. |
| Theme | Enum (Light/Dark/System) | No | "System" | Yes | Employee | Must match enum list | UI color theme preference. |
| Notification Preferences — Email | Boolean | No | true | Yes | Employee | true/false only | Toggle email notifications. |
| Notification Preferences — SMS | Boolean | No | false | Yes | Employee | true/false only | Toggle SMS notifications. |
| Notification Preferences — Push | Boolean | No | true | Yes | Employee | true/false only | Toggle in-app/push notifications. |
| Notification Frequency | Enum (Instant/Daily Digest/Weekly Digest) | No | "Instant" | Yes | Employee | Must match enum list | Batching preference for non-critical alerts. |
| Default Landing Page | Enum (Dashboard/My Expenses/Approvals) | No | "Dashboard" | Yes | Employee | Must match enum list | Page shown on login. |
| Accessibility Mode | Boolean | No | false | Yes | Employee | true/false only | Enables high-contrast/screen-reader-optimized UI. |

---

## 7. Financial & Approval Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Default Expense Currency | String (ISO 4217) | No | Org default | Yes | Employee, Manager | ISO 4217 code | Currency pre-selected on new expense forms. |
| Approval Authority Limit | Number (Decimal) | No | 0 | Yes (Org Admin only) | Manager, Org Admin | Non-negative decimal | Max amount this user can approve without escalation. |
| Delegate Approver | ObjectId Ref (User) | No | null | Yes | Manager, Org Admin | Must be valid active user; time-bound (start/end date) | Temporary approver during leave/absence. |
| Reimbursement Bank Account (masked) | String (tokenized/masked) | No | null | Yes | Employee (self only), Org Admin | Stored via tokenized payment provider; only last 4 digits visible | Bank account for expense reimbursement payouts. |
| Payment Method Preference | Enum (Bank Transfer/Payroll/Wallet) | No | "Bank Transfer" | Yes | Employee | Must match enum list | Preferred reimbursement disbursement method. |
| Tax Identification Number (masked) | String (masked) | No | null | Yes | Employee (self only), Org Admin | Country-specific format; masked in UI | For tax-compliant reimbursement reporting. |

---

## 8. Compliance & Consent

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Terms of Service Accepted | Boolean | Yes | false | No (system-set on acceptance) | Org Admin | true/false only | Confirms ToS acceptance at signup. |
| Terms Accepted Version | String | No | null | No (system-set) | Org Admin | Semantic version string | Tracks which ToS version was accepted. |
| Privacy Policy Consent | Boolean | Yes | false | No (system-set) | Org Admin | true/false only | Confirms privacy policy consent (GDPR/CCPA). |
| Expense Policy Acknowledged | Boolean | Yes | false | Yes | Manager, Org Admin | true/false only | Confirms employee has read the org expense policy. |
| Data Retention Consent | Boolean | No | false | Yes | Org Admin | true/false only | Consent for extended data retention beyond default. |
| Marketing Communication Opt-In | Boolean | No | false | Yes | Employee | true/false only | Opt-in for non-essential communications. |

---

## 9. System Information

| Field Name | Data Type | Required | Default Value | Editable | Visible To | Validation Rules | Description |
|---|---|---|---|---|---|---|---|
| Profile ID (Primary Key) | ObjectId | Yes | Auto-generated | No | — (internal) | MongoDB ObjectId, immutable | Unique database identifier for the profile document. |
| Tenant ID | ObjectId Ref | Yes | Auto-set on creation | No | — (internal) | Must reference valid Organization | Enforces multi-tenant data isolation. |
| Schema Version | Number | Yes | Current version (e.g., 1) | No (system-set) | — (internal) | Positive integer | Tracks document schema version for migrations. |
| Soft Delete Flag | Boolean | Yes | false | No (system-set) | Org Admin | true/false only | Marks record as deleted without physical removal. |
| Created By | ObjectId Ref (User) | No | System / Self | No | Org Admin | Must reference valid user or "system" | Who created the profile (self-signup vs admin-provisioned). |
| Updated By | ObjectId Ref (User) | No | null | No (system-set) | Org Admin | Must reference valid user | Last user who modified the record. |
| Sync Status | Enum (Synced/Pending/Failed) | No | "Synced" | No (system-set) | Org Admin | Must match enum list | Status for external HRMS/SSO sync integrations. |
| External HRMS ID | String | No | null | No (system-set) | Org Admin | Max 100 chars | Reference ID when profile is synced from an external HR system. |
| SSO Provider ID | String | No | null | No (system-set) | Org Admin | Max 100 chars | Identifier from SSO/IdP (Okta, Azure AD, Google Workspace). |

---

### Notes
- All monetary fields use Decimal/Number types with currency stored alongside to avoid floating-point rounding errors.
- All masked/tokenized fields (bank account, TIN) must never be stored or returned in plaintext via API responses — this is a design constraint for the future API layer, not implemented here.
- "Visible To" reflects read visibility only; write/edit permission is separately governed by the "Editable" column combined with role-based access control (RBAC) at the API layer (to be designed later).
- Fields marked "No (system-set)" are populated by backend logic (hooks/triggers), not directly editable via any user-facing form.
