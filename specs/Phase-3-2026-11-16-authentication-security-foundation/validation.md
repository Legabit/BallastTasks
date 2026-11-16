# Validation: Phase 3 – Authentication & Security Foundation

## 1. Acceptance Criteria
Phase 3 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 JWT Token Lifecycle & Rotation
- [x] Login endpoint (`POST /api/auth/login/`) returns `access` and `refresh` tokens for valid credentials.
- [x] Login rejects invalid credentials with HTTP 401 Unauthorized.
- [x] Token refresh endpoint (`POST /api/auth/token/refresh/`) returns a new `access` token and rotated `refresh` token.
- [x] Consumed refresh token is blacklisted; replaying it yields HTTP 401 Unauthorized.
- [x] Access token grants authenticated access to protected endpoints (`Authorization: Bearer <token>`).

### 1.2 User Registration & Profile
- [x] Registration endpoint (`POST /api/auth/register/`) creates a new user and returns user details.
- [x] Registration rejects existing username or existing email with HTTP 400 Bad Request.
- [x] Registration enforces password validation rules (minimum 8 characters, common passwords rejected).
- [x] Profile endpoint (`GET /api/auth/me/`) returns authenticated user details when bearer token is supplied.
- [x] Profile endpoint returns HTTP 401 Unauthorized when unauthenticated.

### 1.3 Rate Limiting & Throttling
- [x] Repeated rapid auth requests trigger HTTP 429 Too Many Requests response with retry-after header.
- [x] Rate limits are enforced through Redis cache.

### 1.4 Security Headers & Documentation
- [x] Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) are present on all HTTP responses.
- [x] Swagger UI at `/swagger/` displays all `/api/auth/` endpoints with request/response schemas and Bearer authorization button.

### 1.5 Test Coverage & Code Quality
- [x] Test coverage on auth app and settings achieves $\ge 80\%$ (achieved 98%):
  ```bash
  docker compose exec backend pytest --cov=apps
  # or locally:
  uv run pytest --cov=apps
  ```
- [x] All tests pass without errors (32 passed).
- [x] Pre-commit hooks and Ruff formatting pass without errors:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result |
| :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. |
| **Migrations** | `docker compose exec backend python manage.py migrate` | `token_blacklist` migrations apply OK. |
| **Registration** | `curl -X POST http://localhost:8000/api/auth/register/ -d '{"username":"bob","email":"bob@example.com","password":"ValidPassword123!"}' -H "Content-Type: application/json"` | HTTP 201 Created. |
| **Login** | `curl -X POST http://localhost:8000/api/auth/login/ -d '{"username":"bob","password":"ValidPassword123!"}' -H "Content-Type: application/json"` | HTTP 200 with `access` & `refresh`. |
| **Me Profile** | `curl http://localhost:8000/api/auth/me/ -H "Authorization: Bearer <access_token>"` | HTTP 200 with user profile JSON. |
| **Token Refresh** | `curl -X POST http://localhost:8000/api/auth/token/refresh/ -d '{"refresh":"<refresh_token>"}' -H "Content-Type: application/json"` | HTTP 200 with new rotated tokens. |
| **Test Suite** | `docker compose exec backend pytest --cov=apps` | 100% tests passing, $\ge 80\%$ coverage. |
