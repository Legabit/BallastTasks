# Requirements: Phase 1 – Project Initialization & Environment Setup

## 1. Executive Summary & Context
Phase 1 establishes the foundational infrastructure, dependency management, containerization, and developer tooling for the Task Management System. Adhering to Clean Architecture principles and stakeholder requirements, this phase ensures a reliable, secure, and reproducible local development environment capable of orchestrating Django, PostgreSQL, Redis, Celery, and a React frontend with a single command.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Standardized project layout separating backend and frontend; robust dependency management (`pyproject.toml`); Docker Compose orchestration for all backing services.
- **Steve (Marketing):** Modern Vite-based React shell running cleanly in modern browsers.
- **Sid (QA):** Pre-commit hooks (linting/formatting), `pytest` test runner setup, and smoke test coverage from day one.
- **Azim (Security):** Secure environment variable management (`.env.example`), container isolation, non-root Docker execution, and explicit exclusion of secrets in `.gitignore`.

## 3. Scope & Deliverables
### In Scope
1. **Repository Layout:** Monorepo architecture containing `backend/`, `frontend/`, and root-level orchestration configuration.
2. **Dependency Management:** Python 3.12+ project configuration with locked dependencies using `uv` (`pyproject.toml` and `uv.lock`).
3. **Backend Scaffolding:**
   - Django project initialization with Django REST Framework (DRF).
   - Environment-driven configuration using `django-environ` / `python-dotenv`.
   - Healthcheck endpoint verifying application, database, and cache readiness.
   - Celery app configuration wired to Redis broker.
4. **Frontend Scaffolding:**
   - React application initialized via Vite.
   - Baseline responsive styling and dev-proxy configuration to backend API.
5. **Docker & Orchestration:**
   - Multi-stage `Dockerfile` for backend (Python 3.12, non-root user).
   - Multi-stage `Dockerfile` for frontend development.
   - `docker-compose.yml` declaring 5 services:
     - `db` (PostgreSQL 15+ with healthcheck)
     - `redis` (Redis 7+ alpine with healthcheck)
     - `backend` (Django DRF development server)
     - `celery_worker` (Celery background task worker)
     - `frontend` (Vite React development server)
6. **Code Quality & Pre-commit:**
   - `.pre-commit-config.yaml` configured with Ruff (linting and formatting) and baseline sanity hooks.
   - Baseline `pytest` configuration (`pytest.ini` / `pyproject.toml`).

### Out of Scope
- Task models, migrations, or domain logic (Phase 2).
- User authentication, JWT endpoints, and permission classes (Phase 3).
- Task CRUD API endpoints and Swagger schema generation (Phase 4).
- Production deployment scripts, CI/CD workflow files, or cloud infrastructure (Phase 8).

## 4. Architectural & Tooling Decisions
| Area | Decision / Recommendation | Rationale |
| :--- | :--- | :--- |
| **Monorepo Layout** | Root split into `/backend` and `/frontend` | Maintains separation of concerns while keeping Docker orchestration unified. |
| **Python Dependency Manager** | `uv` | Fast, standards-compliant (`pyproject.toml`), deterministic `uv.lock`. |
| **Backend Framework** | Django 5.x + DRF on Python 3.12+ | Satisfies engineering core requirements and high community ecosystem support. |
| **Frontend Foundation** | React 18+ with Vite and TypeScript (`react-ts`) | Type safety, high developer ergonomics, zero console warnings. |
| **Styling Solution** | Tailwind CSS | Utility-first, responsive, lightweight design system scaffolding. |
| **Containerization** | Docker Compose v2 | Single-command onboarding (`docker compose up`) with isolated network and volumes. |
