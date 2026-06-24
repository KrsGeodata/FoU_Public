# Security Overview

Status indicators:
- [x] Implemented
- [~] Partial or untested
- [ ] Not implemented

---

## 1. Security Concerns

- Authorization and authentication
- Communication between frontend and backend
- API calls over HTTP instead of HTTPS - switching to HTTPS is likely not possible due to the VM reserving the HTTPS port

### Dependencies

Analyze all external dependencies the application uses and document whether there are any known security concerns. See [issue #170](https://github.com/KrsGeodata/801_26_lokal-llm/issues/170).

---

## 2. Authentication

We use asyncpg for email lookups in the database, which are then checked against passwords hashed with bcrypt stored in the database.

| Check | Status |
|---|---|
| Valid login returns success for active user | [x] |
| Wrong password returns 401 with an error message | [x] |
| Unknown user returns 401 with an error message | [x] |
| Inactive user cannot log in | [x] |
| No leaking credentials in error messages | [x] |

---

## 3. Authorization

Not quite sure how this will look in the project, but at minimum authentication should run server-side.

| Check | Status |
|---|---|
| Users can only access resources they are authorized to access | [ ] |
| Role/permission based access to endpoints | [ ] |
| Auth enforced server-side | [ ] |

---

## 4. Database

The DB pool connection/disconnection is implemented but not fully tested.

| Check | Status |
|---|---|
| Database queries return the expected data types | [x] |
| Database pool connects on startup and disconnects on shutdown | [x] |
| Return types of queries enforced using Pydantic | [x] |


---

## 5. Endpoints

Refining the application to never crash at runtime will likely be an ongoing process, but it is good to keep in mind. Clear error messages are straightforward to implement.

| Check | Status |
|---|---|
| Clear error messaging if APIs are missing | [x] |
| Application does not crash at runtime due to missing catch blocks | [~] |

---

## 6. General Security Practices

Don't pass environment variables or `.env` contents to the LLM or any other AI.

| Check | Status |
|---|---|
| LLM does not leak sensitive data such as `.env` values or user credentials | [x] |
| Environment variables are never passed to the LLM | [x] |
| `.env` is not committed to the repository | [x] |
| Secrets are not directly referenced in source code | [x] |
| Traffic uses HTTPS | [ ] - likely not possible due to the VM reserving the port. A workaround may exist. |
