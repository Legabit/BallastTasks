# Validation: Phase 2 – Database Models & Core Domain

## 1. Acceptance Criteria
Phase 2 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 User Model Integration
- [x] Uses standard `django.contrib.auth.models.User`.
- [x] User creation succeeds with standard auth methods.
- [x] User relations (`creator`, `assignee`) link correctly to tasks.

### 1.2 Task Model & Schema Integrity
- [x] `Task` model created with all required fields (`title`, `description`, `status`, `priority`, `creator`, `assignee`, etc.).
- [x] Status supports 5 states: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED` (default `TODO`).
- [x] Priority supports 4 levels: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (default `MEDIUM`).
- [x] Deleting a creator cascades and removes their created tasks.
- [x] Deleting an assignee sets `assignee` to `NULL` without deleting the task.
- [x] Database indexes on `(status, due_date)` and `(assignee, status)` created in PostgreSQL schema.

### 1.3 Domain Service Layer
- [x] `create_task()` service creates valid task instances and enforces business rules.
- [x] `assign_task()` reassigns task to a new user and updates timestamps.
- [x] `mark_task_completed()` transitions status to `COMPLETED`.
- [x] Domain services raise clear, domain-specific exceptions on invalid operations.

### 1.4 Test Coverage & Quality
- [x] Test coverage across `tasks` app reaches $\ge 80\%$ (achieved 99%):
  ```bash
  docker compose exec backend pytest --cov=apps
  # or locally:
  uv run pytest --cov=apps
  ```
- [x] All unit and domain service tests pass (20 passed):
  ```bash
  uv run pytest
  ```
- [x] Pre-commit hooks and Ruff formatting pass without errors:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result |
| :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. |
| **Migrations** | `docker compose exec backend python manage.py migrate` | `users` and `tasks` migrations apply OK. |
| **Test Suite** | `docker compose exec backend pytest` | All tests pass, 0 failures. |
| **Coverage** | `docker compose exec backend pytest --cov=apps` | $\ge 80\%$ test coverage on domain apps. |
| **Health Check** | `curl -f http://localhost:8000/api/health/` | HTTP 200 OK with database connected. |
