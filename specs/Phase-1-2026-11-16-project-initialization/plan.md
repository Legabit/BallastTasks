# Plan: Phase 1 – Project Initialization & Environment Setup

## Task Group 1: Workspace Structure & Hygiene
- **1.1 Directory Scaffolding:** Create `backend/` and `frontend/` roots while keeping root-level configuration files.
- **1.2 Git Hygiene:** Configure root `.gitignore` covering Python (`.venv`, `__pycache__`, `*.pyc`), Node (`node_modules`, `dist`), IDE artifacts (`.vscode`, `.idea`), Docker volumes, and local environment files (`.env`, `.env.local`).
- **1.3 Environment Template:** Create `.env.example` defining database credentials, Redis URL, Django `SECRET_KEY`, `DEBUG`, allowed hosts, and frontend API base URL.
- **1.4 Pre-commit Configuration:** Set up `.pre-commit-config.yaml` with Ruff (linter + formatter) for Python, trailing whitespace, end-of-file fixers, and check-yaml/check-toml hooks.

## Task Group 2: Python Backend Initialization
- **2.1 Dependency Management Setup:** Initialize `pyproject.toml` in `backend/` using `uv` pinned to Python 3.12+.
- **2.2 Core Dependencies Installation:** Add `django`, `djangorestframework`, `djangorestframework-simplejwt`, `celery`, `redis`, `psycopg[binary]`, `django-environ`, `drf-yasg`, `pytest`, `pytest-django`, `ruff` using `uv add`.
- **2.3 Django Project Creation:** Generate Django project scaffolding (`config/`) with modular settings structure (`base.py`, `local.py`) loading variables from environment.
- **2.4 Healthcheck Endpoint:** Implement lightweight `/api/health/` view checking Django status, PostgreSQL connectivity, and Redis ping.
- **2.5 Celery Application Setup:** Configure `config/celery.py` and ensure settings import broker/backend URLs from environment.
- **2.6 Pytest Setup:** Add `pytest.ini` or `[tool.pytest.ini_options]` in `pyproject.toml` and write initial smoke test for healthcheck.

## Task Group 3: React Frontend Initialization
- **3.1 Vite Project Scaffolding:** Initialize React project inside `frontend/` with Vite (`react-ts` template).
- **3.2 Frontend Dependencies & Styling:** Configure Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`), Lucide icons, and Axios/Fetch wrapper utility.
- **3.3 Base App Shell:** Create clean, modern application shell with header/navigation placeholder, responsive container layout, and zero browser console warnings.
- **3.4 Vite Proxy / Env Configuration:** Configure `vite.config.ts` development proxy routing `/api/` requests to backend service.

## Task Group 4: Docker & Multi-Service Orchestration
- **4.1 Backend Dockerfile:** Write multi-stage, non-root user `Dockerfile` for `backend/` targeting Python 3.12-slim.
- **4.2 Frontend Dockerfile:** Write multi-stage dev/build `Dockerfile` for `frontend/` using Node 20-alpine.
- **4.3 Docker Compose Configuration:** Write root `docker-compose.yml` declaring:
  - `db`: PostgreSQL 15+ container with persistent volume and healthcheck (`pg_isready`).
  - `redis`: Redis 7+ alpine container with persistent volume and healthcheck (`redis-cli ping`).
  - `backend`: Django server service depending on healthy `db` and `redis`.
  - `celery_worker`: Celery worker service running tasks against Redis broker.
  - `frontend`: Vite React dev server with port mapping.
- **4.4 Service Coordination:** Ensure services boot smoothly in correct dependency order with shared internal network.

## Task Group 5: Validation & Smoke Testing
- **5.1 Docker Orchestration Verification:** Run `docker compose up --build` and confirm all 5 containers reach healthy/running state.
- **5.2 Backend Verification:** Confirm Django migrations run, healthcheck endpoint responds `200 OK`, and Celery worker connects to Redis without errors.
- **5.3 Frontend Verification:** Confirm React shell renders in browser without errors or console warnings.
- **5.4 Pre-commit Verification:** Run `pre-commit run --all-files` across entire codebase to ensure spotless linting and formatting.
- **5.5 Documentation:** Update project `README.md` with step-by-step local setup instructions for both Docker and native environments.
