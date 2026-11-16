# Task Management System

A secure, high-performance, and maintainable Task Management System adhering strictly to Clean Architecture principles.

## Tech Stack
- **Backend:** Python 3.12+, Django 5.x, Django REST Framework (DRF), SimpleJWT
- **Database & Cache:** PostgreSQL 15+, Redis 7+
- **Background Tasks:** Celery wired to Redis broker
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **API Documentation:** Swagger / OpenAPI (`drf-yasg`)
- **Developer Tooling:** `uv`, Docker & Docker Compose v2, `pytest`, `ruff`, `pre-commit`

---

## Quickstart (Docker Compose)

Run the entire system (5 orchestrated services) with a single command:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and launch all services
docker compose up --build
```

### Services & Endpoints
| Service | Container | Port / URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `task_management_frontend` | [http://localhost:5173](http://localhost:5173) | React Vite application shell |
| **Backend API** | `task_management_backend` | [http://localhost:8000](http://localhost:8000) | Django DRF REST API |
| **Health Check** | `task_management_backend` | [http://localhost:8000/api/health/](http://localhost:8000/api/health/) | JSON health status |
| **Swagger UI** | `task_management_backend` | [http://localhost:8000/swagger/](http://localhost:8000/swagger/) | Interactive API documentation |
| **ReDoc** | `task_management_backend` | [http://localhost:8000/redoc/](http://localhost:8000/redoc/) | ReDoc API specification |
| **PostgreSQL** | `task_management_db` | `localhost:5432` | Relational database |
| **Redis** | `task_management_redis` | `localhost:6379` | Cache & Celery message broker |
| **Celery Worker** | `task_management_celery` | N/A (background) | Async worker processor |

---

## Local Development (Native)

### 1. Prerequisites
- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- Node.js 20+ & npm

### 2. Backend Setup
```bash
cd backend

# Install dependencies and sync virtualenv
uv sync

# Run database migrations
uv run python manage.py migrate

# Start Django development server
uv run python manage.py runserver 0.0.0.0:8000
```

### 3. Celery Worker (Local)
Ensure Redis is running, then in a separate terminal:
```bash
cd backend
uv run celery -A config worker -l info
```

### 4. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

---

## Quality Assurance & Testing

### Backend Unit & Smoke Tests
```bash
cd backend
uv run pytest
```

### Backend Linting & Formatting (Ruff)
```bash
cd backend
uv run ruff check .
uv run ruff format --check .
```

### Frontend Build & Typecheck
```bash
cd frontend
npm run build
```

### Pre-commit Hooks
```bash
pre-commit install
pre-commit run --all-files
```
