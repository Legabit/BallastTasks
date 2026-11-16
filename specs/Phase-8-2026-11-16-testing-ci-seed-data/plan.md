# Plan: Phase 8 – Testing, CI/CD, & Seed Data

## Task Group 1: Demo Seed Data Management Command
- **1.1 Command Implementation:** Create `backend/apps/tasks/management/commands/seed_data.py`.
  - Create standard stakeholder user personas:
    - `admin@tasks.com` (Superuser)
    - `mary.engineer@tasks.com`
    - `steve.marketing@tasks.com`
    - `sid.qa@tasks.com`
    - `azim.security@tasks.com`
  - Seed tasks distributed across all 5 statuses and 4 priority levels, with dynamic due dates (yesterday, in 6 hours, in 3 days, in 2 weeks, null).
  - Seed realistic notifications for each user.
  - Implement idempotency checks using `get_or_create` / `update_or_create`.
- **1.2 Unit Tests:** Add `backend/tests/test_seed_data.py` verifying that running `call_command("seed_data")` creates expected entities and running it twice does not duplicate records.

## Task Group 2: GitHub Actions Automated CI Pipeline
- **2.1 Workflow Definition:** Create `.github/workflows/ci.yml`.
  - Define `backend` job:
    - Checkout code.
    - Set up Python 3.12 and install `uv`.
    - Run pre-commit hooks (`pre-commit run --all-files`).
    - Run `uv run pytest --cov=apps --cov-fail-under=80`.
  - Define `frontend` job:
    - Checkout code.
    - Set up Node.js 20 and install dependencies (`npm ci`).
    - Run `npm run lint` and `npm run build`.

## Task Group 3: Technical Interview GenAI Documentation
- **3.1 GenAI Documentation File:** Create `GENAI_DOCUMENTATION.md` detailing:
  - Exact prompts used with architectural, security, and TDD constraints.
  - Representative generated code output excerpts (e.g. `services.py`, `IsTaskParticipantOrCreator`, `tasks.py`, `client.ts`).
  - Validation methodology (pytest with coverage, container executions, Swagger verification, pre-commit static analysis).
  - Concrete corrections and hardens (e.g. ISO datetime space decoding, anonymous Docker volume shadowing, email login support, `transaction.on_commit` async safety).
  - Performance, Clean Architecture, and idiom reviews (N+1 query elimination, decoupling services from DRF views).

## Task Group 4: Project Documentation & Final Integration
- **4.1 Comprehensive README.md:** Update project root `README.md` with:
  - Architecture overview and Clean Architecture layer diagram.
  - Quickstart instructions (`docker compose up -d` + `docker compose exec backend python manage.py seed_data`).
  - Demo accounts and seeded credentials table.
  - Test execution instructions (`docker compose exec backend pytest --cov=apps`).
  - Link to `GENAI_DOCUMENTATION.md`.
- **4.2 Live Verification:** Run `python manage.py seed_data` in Docker container and verify tasks in the React UI.
- **4.3 Pre-commit & Final Sign-Off:** Run `pre-commit run --all-files`, update `validation.md`, and commit Phase 8.
