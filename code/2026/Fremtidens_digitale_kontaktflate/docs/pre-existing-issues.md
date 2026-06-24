# Pre-existing Security and Code Quality Issues

Identified during FIKS integration plan review (2026-03-26). These are not caused by the FIKS work but should be addressed in a separate effort.

## CRITICAL

### C1: Personnummer exposed in GET URL paths
**Files:** `backend/app/routes/auth.py` lines 50, 70
```
GET /owner/{personnr}/properties
GET /auth/roles/{personnr}
```
The 11-digit national ID appears in server logs, browser history, proxy logs, and monitoring. Must convert to POST body or session-based lookup.

### C2: No authentication middleware
All backend routes are unauthenticated. After login, no token is issued. The frontend stores raw personnummer in sessionStorage and calls any endpoint freely. Must add JWT or signed token middleware.

### C3: IDOR — any user can access any other user's data
Direct consequence of C2. No server-side check that the requested personnummer/property belongs to the authenticated caller. All data routes are vulnerable.

### C4: Personnummer returned in property info API response
**Files:** `backend/app/schema/property_info.py` lines 9, 18
`OwnerInfo.personnr` and `RepresentantInfo.personnr` are sent to the frontend. Should display names only, not national IDs.

### C5: Database credentials committed to git
**Files:** `backend/backend.env`, `matrikkel-service/matrikkel.env`
Passwords are committed to version control. Move to `.env.example` with placeholders, add `*.env` to `.gitignore`, rotate passwords.

## HIGH

### H1: f-string JSON injection in existing JSONB queries
**Files:** `backend/app/repositories/auth.py` lines 77, 121, 161
```text
{"personnr_filter": f'[{{"PERSONNR": "{personnr}"}}]'}
```
The personnummer is string-interpolated into JSON before SQL binding. Fix: use `json.dumps()` and add server-side validation that personnummer is exactly 11 digits.

### H2: No rate limiting on login endpoint
**File:** `backend/app/routes/auth.py` line 29
`POST /auth/login` is an enumeration oracle (404 vs 200). No rate limiting. Add `slowapi` or similar, limit to 5 attempts/min/IP.

### H3: Test personnummer displayed in production UI
**File:** `frontend/src/pages/Login/LoginPage.tsx` lines 113-119
Hardcoded test values shown on login page. Wrap in `if (import.meta.env.DEV)` check.

## MEDIUM

### M1: Personnummer stored in sessionStorage
**File:** `frontend/src/pages/Login/LoginPage.tsx` line 52
Accessible to any JavaScript on the page (XSS risk). When auth tokens are implemented (C2), store only the token.

### M2: No auth check on byggesak and document routes
**File:** `backend/app/routes/byggesak.py` lines 13, 19
Anyone who can reach the backend can enumerate building cases and documents for any property.

### M3: CORS origins only cover localhost
**File:** `backend/backend.env` line 7
Must be updated for production domain. Document in deployment guide.
