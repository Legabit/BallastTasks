# Requirements: Phase 3 – Authentication & Security Foundation

## 1. Executive Summary & Context
Phase 3 builds the authentication and security infrastructure for the Task Management System. Adhering to stakeholder security mandates (Azim) and Clean Architecture principles, this phase delivers JWT authentication with token rotation, token blacklisting, user registration, user profile (`/me`), rate limiting (throttling), strict password validation rules, and base security headers.

## 2. Stakeholder Alignment
- **Azim (Security):** Strict JWT security using `rest_framework_simplejwt`; token rotation and blacklisting enabled; defense-in-depth rate limiting against brute force attacks; hardened security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`); strict password validation.
- **Mary (Engineering):** Standardized DRF endpoints documented in Swagger/OpenAPI; decoupled auth serializer and views; deterministic token expiration settings.
- **Sid (QA):** Extensive test suite ($\ge 80\%$ coverage) asserting positive auth flows, rejected credentials (401 Unauthorized), token refresh rotation, rate limiting threshold enforcement (429 Too Many Requests), and registration validation.
- **Steve (Marketing):** Clean API contract allowing seamless integration with future React login and profile forms.

## 3. Scope & Deliverables
### In Scope
1. **JWT Authentication & Token Lifecycle:**
   - Login endpoint (`/api/auth/login/` or `/api/auth/token/`) issuing access and refresh tokens.
   - Token refresh endpoint (`/api/auth/token/refresh/`) supporting token rotation.
   - Token blacklist support via `rest_framework_simplejwt.token_blacklist` for revocations.
   - Access token lifetime: 15 minutes; Refresh token lifetime: 1 day (or configurable via `.env`).
2. **User Registration & Profile:**
   - Registration endpoint (`/api/auth/register/`) validating password complexity and unique username/email.
   - Current user endpoint (`/api/auth/me/`) returning authenticated user information (id, username, email, date_joined).
3. **Rate Limiting & Throttling:**
   - Global DRF throttling rates configured for anonymous and authenticated requests:
     - Anonymous users: `60/minute` (global), with stricter limit on auth endpoints (e.g. `10/minute`).
     - Authenticated users: `1000/hour` (or `100/minute`).
   - Custom throttle classes applied to sensitive authentication endpoints.
4. **Security Hardening & Headers:**
   - Django security settings: `X_FRAME_OPTIONS = "DENY"`, `SECURE_CONTENT_TYPE_NOSNIFF = True`, `SECURE_BROWSER_XSS_FILTER = True`.
   - Django password validators enabled (MinimumLengthValidator with $\ge 8$ characters, CommonPasswordValidator, NumericPasswordValidator).
5. **Testing & Documentation:**
   - Unit and integration tests covering registration, login, refresh rotation, `/api/auth/me/`, invalid token handling, and throttle enforcement.
   - OpenAPI/Swagger documentation updated with auth tags and bearer token authorization schemes.

### Out of Scope
- Task CRUD endpoints and task permission checks (Phase 4).
- Celery background notifications on login/registration (Phase 5).
- React login/register UI forms and auth context/state (Phase 6).

## 4. Architectural & Security Decisions
| Decision Area | Chosen Standard | Rationale |
| :--- | :--- | :--- |
| **Auth Mechanism** | JWT (`djangorestframework-simplejwt`) | Stateless API authentication matching DRF and React decoupling. |
| **Token Rotation** | `ROTATE_REFRESH_TOKENS = True`, `BLACKLIST_AFTER_ROTATION = True` | Minimizes replay attacks by invalidating used refresh tokens immediately. |
| **Throttling Cache** | Redis-backed cache | Shared in-memory rate limiting across multiple app worker processes. |
| **Password Validation** | Standard Django Auth Validators + min 8 chars | Blocks trivially guessable passwords without over-restricting user choice. |
