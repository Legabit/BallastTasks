# Requirements: Phase 4 – Task CRUD & API Endpoints

## 1. Executive Summary & Context
Phase 4 implements the core RESTful API endpoints for task management. Building on the domain model (Phase 2) and JWT security foundation (Phase 3), this phase provides full CRUD capabilities, strict object-level permissions, deterministic pagination, multi-attribute filtering (by status, priority, due date range, and assignment), search, ordering, and interactive OpenAPI documentation via Swagger UI.

## 2. Stakeholder Alignment
- **Mary (Engineering):** RESTful resource conventions (`/api/tasks/`, `/api/tasks/{id}/`); DRF ViewSets / Generic Views utilizing existing domain service layer (`apps.tasks.services`); query optimization (`select_related("creator", "assignee")`) to prevent N+1 query regressions.
- **Steve (Marketing):** Consistent API response structures with clear status strings and pagination metadata (`count`, `next`, `previous`, `results`) to ensure easy frontend consumption.
- **Sid (QA):** Extensive TDD test suite ($\ge 80\%$ coverage) covering CRUD operations, status/date filtering combinations, pagination boundaries, and cross-user authorization barriers.
- **Azim (Security):** Object-level permissions enforcing access control (e.g., users can only read tasks they created or are assigned to; only creator/admin can delete tasks; unauthorized mutations return 403 Forbidden).

## 3. Scope & Deliverables
### In Scope
1. **Task Serializers (`apps.tasks.serializers`):**
   - `TaskListSerializer`: Lightweight serializer for list views with embedded creator/assignee metadata.
   - `TaskDetailSerializer`: Full serializer including descriptions, timestamps, and writable field validation.
   - `TaskCreateUpdateSerializer`: Validates title, status, priority, due date, and assignee fields; delegates to domain services.
2. **RESTful Task Endpoints (`/api/tasks/`):**
   - `GET /api/tasks/`: List tasks accessible to authenticated user (paginated, filterable, searchable, orderable).
   - `POST /api/tasks/`: Create a task with authenticated user automatically set as creator.
   - `GET /api/tasks/{id}/`: Retrieve detailed task information.
   - `PUT / PATCH /api/tasks/{id}/`: Full or partial task update.
   - `DELETE /api/tasks/{id}/`: Delete a task (restricted to creator or admin).
3. **Filtering, Search & Ordering:**
   - Filter by `status` (e.g. `?status=TODO` or `?status=IN_PROGRESS`).
   - Filter by `priority` (e.g. `?priority=HIGH`).
   - Filter by due date range (e.g. `?due_date_after=...` and `?due_date_before=...` or exact date).
   - Filter by assignment (e.g. `?assigned_to_me=true` or `?created_by_me=true`).
   - Search by `title` and `description` via `?search=...`.
   - Ordering by `due_date`, `created_at`, `priority`, `status` via `?ordering=...`.
4. **Pagination:**
   - Standard PageNumberPagination with configurable page size (`page_size=10`, `max_page_size=100`).
5. **Object-Level Permissions (`IsCreatorOrAssigneeReadOnly`, etc.):**
   - Authenticated user can view tasks where `creator == user` OR `assignee == user` (or global visibility if scoped).
   - Only `creator` (or superuser) can modify or delete task records.
6. **OpenAPI / Swagger Documentation:**
   - Endpoints annotated with `drf-yasg` schemas, query parameters, request bodies, and responses.

### Out of Scope
- Celery background worker notifications triggered on assignment (Phase 5).
- React frontend components, routing, and task tables (Phase 6 & 7).

## 4. Architectural Decisions
| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **View Architecture** | DRF `ModelViewSet` with custom permission & filter backends | Idiomatic DRF approach; provides standard router actions cleanly. |
| **Object Permissions** | Custom `BasePermission` (`IsTaskParticipantOrCreator`) | Guarantees multi-tenant data privacy and prevents cross-user tampering. |
| **Query Efficiency** | `select_related('creator', 'assignee')` on all queryset lookups | Eliminates N+1 database queries on paginated list operations. |
| **Filtering Library** | `django-filter` / `DjangoFilterBackend` + `SearchFilter` + `OrderingFilter` | Declarative, battle-tested parameter parsing matching DRF ecosystem standards. |
