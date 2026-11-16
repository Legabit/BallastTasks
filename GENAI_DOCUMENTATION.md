# Generative AI Documentation & Engineering Analysis

This document fulfills **Section 11 (GenAI Component)** of the Task Management System technical assessment specification. It details the prompts, representative outputs, validation methodology, architectural corrections, edge case hardening, and performance reviews conducted during the AI-assisted implementation.

---

## 1. Primary Prompts & Architectural Constraints

The system was developed iteratively across 8 defined phases using Google DeepMind's Antigravity agentic engine. Below is the master prompt defining the core architectural, security, and quality gates applied throughout development:

```text
Develop a production-grade, secure, performant Task Management System following Clean Architecture principles.

Stack Requirements:
- Backend: Python 3.12, Django 5.2, Django REST Framework (DRF), Celery + Redis, PostgreSQL 15, uv package manager.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, react-router-dom v7.
- DevOps: Multi-container Docker Compose with non-root security contexts, GitHub Actions CI.

Architectural & Domain Constraints:
1. Clean Architecture: Decouple domain business logic from HTTP view controllers into an explicit service layer (apps.tasks.services). Models remain thin; views delegate lifecycle operations to domain services.
2. Object-Level Permissions: Restrict task operations such that users can only view, update, and delete tasks they created or are assigned to. System administrators retain global visibility.
3. Asynchronous Workers: Offload assignment notifications and scheduled due-date reminders to Celery workers backed by Redis, wrapped in transaction.on_commit hooks.
4. Security Hardening: Implement JWT token rotation with blacklisting, rate limiting on authentication (10 req/min) and API endpoints (1000 req/hr), and OWASP Top 10 defenses (SQL injection prevention via ORM, CORS configuration, sanitized inputs).
5. Testing & Quality: TDD methodology with >= 80% test coverage enforced in CI. Zero browser console errors and clean linting via pre-commit (Ruff) and Oxlint.
```

---

## 2. Representative Generated Code Excerpts

### A. Clean Architecture Domain Service (`backend/apps/tasks/services.py`)
Decouples business validation and state transitions from DRF `ModelViewSet`:

```python
class TaskService:
    @staticmethod
    def create_task(*, creator: User, title: str, description: str = "",
                    status: str = TaskStatus.TODO, priority: str = TaskPriority.MEDIUM,
                    due_date: datetime | None = None, assignee: User | None = None) -> Task:
        clean_title = (title or "").strip()
        if not clean_title:
            raise ValidationError({"title": "Task title cannot be blank."})

        task = Task.objects.create(
            creator=creator,
            assignee=assignee,
            title=clean_title,
            description=(description or "").strip(),
            status=status,
            priority=priority,
            due_date=due_date,
        )
        return task
```

### B. Object-Level Security Permission (`backend/apps/tasks/permissions.py`)
Enforces multi-tenant authorization barriers at the object boundary:

```python
class IsTaskParticipantOrCreator(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True
        if obj.creator == request.user:
            return True
        if obj.assignee == request.user:
            if request.method in permissions.SAFE_METHODS:
                return True
            if request.method in ["PUT", "PATCH"]:
                editable_fields = {"status"}
                incoming_fields = set(request.data.keys())
                return incoming_fields.issubset(editable_fields)
            return False
        return False
```

### C. Transaction-Safe Asynchronous Worker Trigger (`backend/apps/tasks/signals.py`)
Guarantees Celery worker does not query uncommitted PostgreSQL rows:

```python
@receiver(post_save, sender=Task)
def task_post_save_handler(sender, instance: Task, created: bool, **kwargs):
    if instance.assignee:
        previous_assignee_id = getattr(instance, "_previous_assignee_id", None)
        if created or (previous_assignee_id != instance.assignee_id):
            transaction.on_commit(
                lambda: send_task_assignment_notification.delay(
                    task_id=instance.id,
                    assignee_id=instance.assignee_id,
                )
            )
```

### D. Axios Interceptor with Transparent Token Refresh (`frontend/src/api/client.ts`)
Queues pending requests during token refresh cycles to eliminate 401 race conditions:

```typescript
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return client(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      // Refresh token rotation logic ...
    }
    return Promise.reject(error)
  }
)
```

---

## 3. Validation Methodology

Every AI-generated component was subjected to a multi-tiered verification pipeline prior to acceptance:

1. **Test-Driven Verification:** Unit and integration test suites were executed before and after every modification. Total backend test coverage was raised to **96.30%** (79 automated tests across auth, tasks, notifications, and commands).
2. **Static Analysis & Formatting:** `pre-commit` hooks enforced Ruff linting, imports sorting, YAML/TOML syntax checks, and file hygiene across all commits. Frontend code was validated via `oxlint` and TypeScript compiler (`tsc -b`).
3. **Container Isolation Testing:** Every feature was validated inside the isolated Docker Compose multi-container environment (`backend`, `celery`, `db`, `redis`, `frontend`) to ensure runtime compatibility across Linux ARM/x86 architectures.
4. **Interactive Schema Auditing:** The Swagger UI (`/swagger/`) was inspected to confirm that serializers, filters, request bodies, and response codes matched OpenAPI 2.0 specifications.
5. **Real-Time Browser Testing:** The React frontend was tested across viewport widths (375px mobile to 1920px desktop) with browser dev tools open to ensure zero unhandled rejections, memory leaks, or console warnings.

---

## 4. Key Corrections & Hardening Log

During generation, several subtle edge cases and infrastructure mismatches were identified and corrected:

| Issue Identified | Root Cause | Engineering Correction |
| :--- | :--- | :--- |
| **ISO Datetime Space Decoding** | Browsers sending `+00:00` in URL query strings decoded `+` as space (` `), breaking DRF `IsoDateTimeFilter`. | Implemented custom regex sanitization in `apps.tasks.filters.IsoDateTimeFilter` restoring timezone offsets before parsing. |
| **Docker Volume Shadowing** | An anonymous volume `/app/node_modules` shadowed updated packages (`react-router-dom`), causing missing module errors. | Rebuilt container with `--renew-anon-volumes` and pinned dependencies directly into Docker build artifacts. |
| **Host vs Container Hostname** | Host browsers attempting to reach `http://backend:8000` failed with `ERR_NAME_NOT_RESOLVED`. | Configured frontend Axios client with relative `baseURL: ""` and leveraged Vite dev proxy (`/api` -> `http://backend:8000`). |
| **Celery Worker DB Race Condition** | Celery tasks dispatched via Django ORM signals fired before the transaction committed, occasionally raising `Task.DoesNotExist`. | Wrapped all asynchronous worker calls in `transaction.on_commit(...)`. |
| **Case-Insensitive Dual Login** | Default SimpleJWT required exact username; users attempting to log in via email received 401 Unauthorized. | Built `CustomTokenObtainPairSerializer` querying `User.objects.filter(Q(username__iexact=v) | Q(email__iexact=v))`. |
| **React Impure Render Warnings** | `Date.now()` inside `useMemo` triggered React Compiler purity warnings in Oxlint. | Refactored timestamp evaluation to `useState(() => Date.now())` to ensure idempotent rendering. |

---

## 5. Edge Cases & Authentication Hardening

1. **Strict Permission Barriers:**
   - Unauthenticated requests receive immediate `401 Unauthorized`.
   - Users attempting to read, update, or delete tasks belonging to other users receive `404 Not Found` or `403 Forbidden`.
   - Assignees can only transition task `status`; attempting to reassign or modify `title`/`description` returns `403 Forbidden`.
2. **Idempotent Background Jobs:**
   - Due-date reminder Celery task queries tasks due within 24 hours and checks `Notification.objects.filter(...)` to prevent duplicate alerts within the active window.
3. **Authentication Throttling:**
   - Brute-force protection limits unauthenticated login and registration attempts to **10 requests per minute** via `apps.authentication.throttles.AuthRateThrottle`.
4. **Token Invalidation & Rotation:**
   - Refresh tokens are single-use; rotating a token blacklists the prior refresh token in the Redis/Postgres store to prevent replay attacks.

---

## 6. Performance & Clean Architecture Idiom Review

- **Elimination of N+1 Queries:** Task list queries invoke `.select_related("creator", "assignee")`, reducing database round-trips from $O(N)$ to $O(1)$. Verified with `django.test.utils.CaptureQueriesContext`.
- **Database Indexing:** Compound indexes on `("status", "due_date")` and `("created_at",)` optimize high-frequency filtering and ordering.
- **Decoupled Business Logic:** All task state transitions occur inside `apps.tasks.services.TaskService`. Views remain thin HTTP adapters handling request deserialization and response formatting.
- **Frontend Optimistic UI:** Task status drag-and-drop and one-click completion buttons immediately reflect in local state while dispatching background API patches, with graceful fallback rollback on network failure.
