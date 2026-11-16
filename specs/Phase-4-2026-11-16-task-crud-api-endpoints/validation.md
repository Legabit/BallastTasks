# Validation: Phase 4 – Task CRUD & API Endpoints

## 1. Acceptance Criteria
Phase 4 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 CRUD Endpoints Functionality
- [x] `POST /api/tasks/` creates a new task; sets authenticated user as creator; returns HTTP 201 Created.
- [x] `GET /api/tasks/` returns a paginated list of tasks accessible to the authenticated user.
- [x] `GET /api/tasks/{id}/` returns detailed task object with creator and assignee data.
- [x] `PATCH /api/tasks/{id}/` updates task fields (title, status, priority, due_date, assignee) and returns HTTP 200 OK.
- [x] `DELETE /api/tasks/{id}/` removes the task and returns HTTP 204 No Content.

### 1.2 Object-Level Permissions & Security
- [x] Unauthenticated requests to `/api/tasks/` return HTTP 401 Unauthorized.
- [x] User cannot access or modify a task they did not create and are not assigned to (returns HTTP 404 or 403).
- [x] Assignee can view task details and update status/progress, but cannot delete the task.
- [x] Only task creator (or admin) can delete a task.

### 1.3 Filtering, Search & Pagination
- [x] Filtering by `?status=TODO` returns only tasks with `TODO` status.
- [x] Filtering by `?priority=HIGH` returns only high-priority tasks.
- [x] Filtering by due date range (`?due_date_after=...` & `?due_date_before=...`) correctly filters task records.
- [x] Full-text search (`?search=keyword`) matches against `title` and `description`.
- [x] Response adheres to standard pagination schema (`count`, `next`, `previous`, `results`).

### 1.4 API Documentation & Quality
- [x] Swagger documentation at `/swagger/` displays all `/api/tasks/` endpoints with complete parameter definitions.
- [x] Query optimization verified: list view does not trigger N+1 query warnings.
- [x] Test coverage on `apps.tasks` achieves $\ge 80\%$:
  ```bash
  docker compose exec backend pytest --cov=apps
  # or locally:
  uv run pytest --cov=apps
  ```
- [x] All pre-commit hooks and Ruff checks pass without errors:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result |
| :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. |
| **Task Creation** | `curl -X POST http://localhost:8000/api/tasks/ -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"title":"API Task","priority":"HIGH"}'` | HTTP 201 Created. |
| **Task Listing** | `curl http://localhost:8000/api/tasks/ -H "Authorization: Bearer <token>"` | HTTP 200 with paginated results. |
| **Filtering** | `curl "http://localhost:8000/api/tasks/?status=TODO" -H "Authorization: Bearer <token>"` | Filtered task array. |
| **Permissions Check** | User B attempts `DELETE /api/tasks/{user_a_task_id}/` | HTTP 403 / 404. |
| **Test Suite** | `docker compose exec backend pytest --cov=apps` | $\ge 80\%$ coverage, 0 failures. |
