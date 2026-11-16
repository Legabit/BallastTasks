# Requirements: Phase 2 – Database Models & Core Domain

## 1. Executive Summary & Context
Phase 2 establishes the core relational data models, database migrations, model validation rules, and domain service layer for the Task Management System. Adhering to Clean Architecture and stakeholder guidelines, domain logic is isolated into dedicated service functions, keeping models and views decoupled while ensuring database integrity and auditability.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Standard Django `User` model (`django.contrib.auth.models.User`) as agreed; clean separation between data models and domain business services; indexing on query-critical fields (`status`, `due_date`, `assignee`).
- **Steve (Marketing):** Intuitive task states and priorities supporting polished UI display in later phases.
- **Sid (QA):** Comprehensive TDD coverage ($\ge 80\%$) validating model constraints, edge cases (past due dates, invalid status transitions, cascading deletions), and domain service boundaries.
- **Azim (Security):** Strict field validation, prevention of orphaned task records, immutable timestamps (`created_at`, `updated_at`), and ownership tracking for multi-user isolation.

## 3. Scope & Deliverables
### In Scope
1. **User Integration:**
   - Utilize standard Django `User` model (`django.contrib.auth.models.User`).
   - Verified integration with admin and foreign key relations.
2. **Task Model (`tasks` app):**
   - Fields:
     - `title`: `CharField(max_length=255)` (required, non-blank).
     - `description`: `TextField(blank=True)` (markdown-friendly).
     - `status`: `CharField` with choices (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`), default `TODO`.
     - `priority`: `CharField` with choices (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), default `MEDIUM`.
     - `due_date`: `DateTimeField(null=True, blank=True)`.
     - `creator`: `ForeignKey(User, on_delete=CASCADE, related_name="created_tasks")`.
     - `assignee`: `ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name="assigned_tasks")`.
     - `created_at`: `DateTimeField(auto_now_add=True)`.
     - `updated_at`: `DateTimeField(auto_now=True)`.
   - Indexing: Composite/single indexes on `[status, due_date]`, `[assignee, status]`.
3. **Domain Service Layer (`apps/tasks/services.py`):**
   - `create_task(...)`: Encapsulates task creation and validates business rules.
   - `update_task(...)`: Handles updates with audit/dirty-check hooks.
   - `assign_task(task, assignee)`: Reassigns task with validation.
   - `mark_task_completed(task)`: Transitions status and records completion state.
4. **Database Migrations:**
   - Initial clean migrations for `tasks`.
   - Verified backwards and forwards compatibility against PostgreSQL.
5. **Testing (TDD):**
   - Unit tests covering model validation, default values, string representations, foreign keys, and indexes.
   - Domain service test suite validating business logic in isolation.

### Out of Scope
- REST API views, serializers, and URL routing (Phase 4).
- JWT token authentication endpoints (Phase 3).
- Celery notification task execution triggered by assignments (Phase 5).
- Frontend task rendering and forms (Phase 6 & 7).

## 4. Architectural & Schema Decisions
| Decision Area | Chosen Standard | Rationale |
| :--- | :--- | :--- |
| **User Architecture** | Standard `django.contrib.auth.models.User` | Leverages built-in Django auth model without extra custom user overhead. |
| **Domain Services** | Explicit Service Layer (`services.py`) | Clean Architecture principle; keeps models thin and views dumb; testable without HTTP mocking. |
| **Task Status Enum** | `TextChoices` (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`) | 5-state lifecycle supporting granular Kanban/scrum workflows. |
| **Task Priority Enum** | `TextChoices` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) with default `MEDIUM` | Provides standard 4-level triage capability. |
| **Deletion Policy** | `CASCADE` for creator, `SET_NULL` for assignee | Prevent orphaned tasks if creator deleted; preserve task history if assignee removed. |
