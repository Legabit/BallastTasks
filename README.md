# Task Management System (TaskFlow)

A production-grade, secure, and maintainable Task Management System adhering strictly to **Clean Architecture** principles. Built as a full-stack showcase featuring Django REST Framework, Celery, Redis, PostgreSQL, and React 19 with Tailwind CSS.

---

## 1. System Architecture & Design

The application enforces a Clean Architecture boundary decoupling HTTP delivery, business rules, and persistence:

```text
+---------------------------------------------------------------+
|                      Presentation Layer                       |
|   - React 19 Frontend (Vite, Tailwind CSS, Lucide Icons)     |
|   - Django REST Framework (Serializers, ViewSets, Swagger)    |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                      Application Services                     |
|   - TaskService (apps.tasks.services)                         |
|   - NotificationService (apps.notifications.tasks)            |
|   - Object-Level Authorization (IsTaskParticipantOrCreator)   |
+---------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------+
|                      Domain & Persistence                     |
|   - Models: Task, Notification, Custom User                   |
|   - Database: PostgreSQL 15 (Compound Indexes, Constraints)   |
|   - Cache & Queue: Redis 7 + Celery Workers (Async Reminders) |
+---------------------------------------------------------------+
```

### Core Capabilities
- **Dual Board Views:** Switch seamlessly between interactive Kanban columns (Backlog, To Do, In Progress, In Review, Completed) and a sortable, paginated Table view.
- **Clean Architecture Domain Services:** Task mutations, status transitions, and assignment logic are isolated in `apps.tasks.services.TaskService`.
- **Object-Level Security:** Strict multi-tenant authorization prevents users from accessing or modifying tasks outside their ownership or assignment.
- **Asynchronous Workers:** Background Celery workers process task assignment alerts and schedule automated 24-hour due-date reminders without blocking HTTP threads.
- **JWT Authentication & Rotation:** Secure token rotation with blacklisting, rate limiting (10 req/min for auth, 1000 req/hr general), and transparent token refresh in the frontend Axios client.
- **Comprehensive API Documentation:** Interactive OpenAPI 2.0 schema via Swagger UI (`/swagger/`) and ReDoc (`/redoc/`).

---

## 2. Quickstart (Docker Compose)

Launch the complete 5-container production-mirrored stack with demo seed data in two commands:

```bash
# 1. Build and start all orchestrated containers
docker compose up -d --build

# 2. Populate demo accounts, sample tasks, and notifications
docker compose exec backend python manage.py seed_data
```

### Services & Endpoints
| Service | URL / Access | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | React 19 Kanban & Table workspace |
| **Swagger UI** | [http://localhost:8000/swagger/](http://localhost:8000/swagger/) | Interactive API explorer & tester |
| **ReDoc UI** | [http://localhost:8000/redoc/](http://localhost:8000/redoc/) | ReDoc schema documentation |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Django administration panel |
| **Health API** | [http://localhost:8000/api/health/](http://localhost:8000/api/health/) | JSON health check endpoint |
| **PostgreSQL Database** | `localhost:5432` | Relational storage (`tasks_db`) |
| **Redis Cache / Broker**| `localhost:6379` | Celery broker & token blacklist |
| **Celery Worker** | Background container | Async task and reminder processor |

---

## 3. Demo Credentials

The database includes 5 pre-configured stakeholder personas across distinct permission tiers. You can sign in using **either** username or email:

| Persona / Role | Username | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Superuser** | `admin@tasks.com` | `admin@tasks.com` | `adminpassword123` | Global visibility across all tasks & system admin |
| **Mary (Engineering)**| `mary.engineer` | `mary.engineer@tasks.com` | `demopassword123` | Full task CRUD & assignment access |
| **Steve (Marketing)** | `steve.marketing` | `steve.marketing@tasks.com` | `demopassword123` | Task creation, updating, and viewing |
| **Sid (QA Lead)** | `sid.qa` | `sid.qa@tasks.com` | `demopassword123` | Task verification and review |
| **Azim (Security)** | `azim.security` | `azim.security@tasks.com` | `demopassword123` | Task auditing and authorization testing |

---

## 4. Testing & Verification

### Backend Automated Test Suite
The backend is covered by 79 comprehensive tests with **96.30% coverage** (well above the $\ge 80\%$ interview requirement):

```bash
# Execute complete test suite inside Docker with coverage enforcement
docker compose exec backend pytest --cov=apps --cov-fail-under=80

# Run specific test modules
docker compose exec backend pytest tests/test_tasks_api.py -v
docker compose exec backend pytest tests/test_auth.py -v
docker compose exec backend pytest tests/test_notifications.py -v
docker compose exec backend pytest tests/test_seed_data.py -v
```

### Frontend Linting & Build
The frontend compiles with zero errors and passes strict static analysis:

```bash
cd frontend

# Run Oxlint
npm run lint

# Compile TypeScript and bundle with Vite
npm run build
```

### Pre-commit Code Quality Hooks
```bash
pre-commit run --all-files
```

---

## 5. Local Development (Without Docker)

### Prerequisites
- Python 3.12+ and [`uv`](https://docs.astral.sh/uv/)
- Node.js 20+ and `npm`
- Running instances of PostgreSQL 15 and Redis 7

```bash
# Backend setup
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py seed_data
uv run python manage.py runserver 0.0.0.0:8000

# Celery worker (in separate terminal)
cd backend
uv run celery -A config worker -l info

# Frontend setup (in separate terminal)
cd frontend
npm install
npm run dev
```

---

## 6. Project Documentation & Artifacts
- **[GENAI_DOCUMENTATION.md](GENAI_DOCUMENTATION.md):** Complete technical evaluation record for Section 11 detailing prompts, representative outputs, validation methodology, corrections, and edge-case hardening.
- **[specs/roadmap.md](specs/roadmap.md):** Engineering roadmap tracking all 8 completed development phases.
- **[specs/tech-stack.md](specs/tech-stack.md):** Architectural decisions and technical stack specifications.
