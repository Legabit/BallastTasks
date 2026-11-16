# Plan: Phase 2 – Database Models & Core Domain

## Task Group 1: Tasks App Scaffolding & Relational Domain Model
- **1.1 Tasks App Initialization:** Create `backend/apps/tasks/` app and register in `INSTALLED_APPS`.
- **1.2 Status & Priority Enumerations:** Define `TaskStatus` (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`) and `TaskPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) using Django `models.TextChoices`.
- **1.3 Task Model Implementation:** Implement `Task` model with `title`, `description`, `status` (default `TODO`), `priority` (default `MEDIUM`), `due_date`, `creator` (FK to `django.contrib.auth.models.User`), `assignee`, `created_at`, `updated_at`.
- **1.4 Query Optimization Indexes:** Add composite indexes on `['status', 'due_date']` and `['assignee', 'status']` in `Task.Meta`.
- **1.5 Task Model Unit Tests:** Write TDD unit tests validating field constraints (max length, nullability, blank fields, foreign key cascade behaviors).

## Task Group 2: Clean Domain Service Layer
- **2.1 Service Layer Structure:** Create `apps/tasks/services.py` dedicated to domain operations.
- **2.2 Task Creation Service:** Implement `create_task(creator, title, ...)` with validation rules.
- **2.3 Task Mutation Services:** Implement `update_task(...)`, `assign_task(task, assignee, ...)` and `mark_task_completed(task)`.
- **2.4 Domain Service Unit Tests:** Write comprehensive unit tests for all domain service functions validating boundary conditions and error handling.

## Task Group 3: Database Migrations & Environment Verification
- **3.1 Migration Generation:** Run `python manage.py makemigrations tasks` and inspect generated SQL schema via `sqlmigrate`.
- **3.2 Migration Execution:** Apply migrations against PostgreSQL container and verify schema tables/indexes.
- **3.3 Docker Integration Check:** Verify backend container starts and runs migrations cleanly without startup warnings or conflicts.

## Task Group 4: Validation & Quality Assurance
- **4.1 Test Suite Run:** Execute complete pytest test suite ensuring $\ge 80\%$ code coverage across new app.
- **4.2 Linting & Formatting:** Run Ruff linter and formatter across all backend files.
- **4.3 Pre-commit Verification:** Ensure all pre-commit hooks pass cleanly.
