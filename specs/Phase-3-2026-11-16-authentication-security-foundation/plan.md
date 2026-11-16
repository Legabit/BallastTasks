# Plan: Phase 3 – Authentication & Security Foundation

## Task Group 1: JWT & Security Settings Configuration
- **1.1 SimpleJWT Configuration:** Configure `SIMPLE_JWT` settings in `config/settings.py` (access token 15 min, refresh token 1 day, token rotation enabled, blacklist enabled).
- **1.2 Installed Apps Update:** Register `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS` and generate/apply blacklist migrations.
- **1.3 Rate Limiting / Throttling Settings:** Configure DRF default throttle classes (`AnonRateThrottle`, `UserRateThrottle`) and throttle rates in `REST_FRAMEWORK` settings.
- **1.4 Security Headers Hardening:** Audit and enforce security headers (`X_FRAME_OPTIONS`, `SECURE_CONTENT_TYPE_NOSNIFF`) in settings.

## Task Group 2: Authentication App & API Endpoints
- **2.1 Auth App Creation:** Create `backend/apps/authentication/` and register in `INSTALLED_APPS`.
- **2.2 Serializers Implementation:**
  - `UserRegistrationSerializer`: Handles registration validation, email presence, password hashing.
  - `UserSerializer`: Serializes safe public profile fields (`id`, `username`, `email`, `date_joined`).
  - `CustomTokenObtainPairSerializer`: Optionally enriches token claims with user metadata.
- **2.3 API Views Implementation:**
  - `RegisterView`: Public endpoint creating new active users.
  - `MeView`: Protected endpoint (`IsAuthenticated`) returning authenticated user profile.
  - Custom Login / Refresh views with rate-limiting throttling decorators.
- **2.4 URL Routing:** Register `/api/auth/register/`, `/api/auth/login/`, `/api/auth/token/refresh/`, and `/api/auth/me/` in `config/urls.py`.

## Task Group 3: Rate Limiting & Custom Throttles
- **3.1 Auth Rate Throttles:** Implement dedicated `AuthAnonRateThrottle` limiting login/registration attempts per IP (e.g. 10 requests per minute).
- **3.2 Throttle Integration:** Attach `AuthAnonRateThrottle` to registration and login views.
- **3.3 Swagger Documentation:** Annotate authentication endpoints with `drf-yasg` schemas for Swagger UI.

## Task Group 4: Test Suite & Verification (TDD)
- **4.1 Registration Tests:** Test successful user registration, missing fields, duplicate email/username, short/common password rejections.
- **4.2 JWT Lifecycle Tests:** Test login with valid credentials (returns tokens), invalid credentials (401), token refresh rotation, and blacklisting of consumed refresh tokens.
- **4.3 Protected Profile Tests:** Test `/api/auth/me/` with valid bearer token (200), expired token (401), and missing header (401).
- **4.4 Rate Limiting Tests:** Test that exceeding rate limits returns HTTP 429 Too Many Requests.
- **4.5 Coverage Verification:** Confirm $\ge 80\%$ test coverage on authentication endpoints.
