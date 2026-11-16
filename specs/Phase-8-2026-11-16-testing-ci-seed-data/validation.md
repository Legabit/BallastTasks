# Validation: Phase 8 – Testing, CI/CD, & Seed Data

## 1. Acceptance Criteria
Phase 8 is complete and the full project is eligible for final sign-off when all criteria below are verified.

### 1.1 Demo Seed Data
- [x] Running `python manage.py seed_data` populates:
  - 5 stakeholder user accounts (`admin@tasks.com`, `mary.engineer@tasks.com`, etc.).
  - 15+ diverse tasks across all 5 statuses and 4 priority levels with realistic due dates.
  - Sample notifications for users.
- [x] Running `seed_data` multiple times is idempotent (no duplicated records).
- [x] Seed data unit tests pass:
  ```bash
  uv run pytest tests/test_seed_data.py
  ```

### 1.2 GitHub Actions CI Pipeline
- [x] `.github/workflows/ci.yml` is committed and valid YAML.
- [x] Backend job executes `pre-commit run --all-files` and `pytest --cov=apps --cov-fail-under=80`.
- [x] Frontend job executes `npm run lint` and `npm run build`.

### 1.3 Documentation & Deliverables
- [x] `README.md` includes clear setup steps (`docker compose up`), demo credentials table, architecture notes, and test commands.
- [x] `GENAI_DOCUMENTATION.md` comprehensively covers prompts, generated code, validation, corrections, edge cases, and performance idioms.

### 1.4 System Health & Coverage
- [x] Entire backend test suite passes with $\ge 80\%$ coverage (currently 96.30%):
  ```bash
  docker compose exec backend pytest --cov=apps
  ```
- [x] Frontend builds cleanly with zero errors:
  ```bash
  cd frontend && npm run build
  ```
- [x] All pre-commit hooks pass:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. | PASSED |
| **Seed Data Execution**| `docker compose exec backend python manage.py seed_data` | Seed data loaded successfully. | PASSED |
| **Backend Test Suite** | `docker compose exec backend pytest --cov=apps` | $\ge 80\%$ test coverage, 0 failures. | PASSED (96.30%) |
| **Frontend Lint & Build**| `cd frontend && npm run lint && npm run build` | 0 errors. | PASSED |
| **Live UI Verification**| Log in as `admin@tasks.com` or `mary.engineer@tasks.com` | Full Kanban and Table boards populated. | PASSED |
