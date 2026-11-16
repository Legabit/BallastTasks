# Validation: Phase 4 – Task CRUD & API Endpoints

## 1. Acceptance Criteria
Phase 4 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 CRUD Endpoints Functionality
- [ ] `POST /api/tasks/` creates a new task; sets authenticated user as creator; returns HTTP 201 Created.
- [ ] `GET /api/tasks/` returns a paginated list of tasks accessible to the authenticated user.
- [ ] `GET /api/tasks/{id}/` returns detailed task object with creator and assignee data.
- [ ] `PATCH /api/tasks/{id}/` updates task fields (title, status, priority, due_date, assignee) and returns HTTP 200 OK.
- [ ] `DELETE /api/tasks/{id}/` removes the task and returns HTTP 204 No Content.

### 1.2 Object-Level Permissions & Security
- [ ] Unauthenticated requests to `/api/tasks/` return HTTP 401 Unauthorized.
- [ ] User cannot access or modify a task they did not create and are not assigned to (returns HTTP 404 or 403).
- [ ] Assignee can view task details and update status/progress, but cannot delete the task.
- [ ] Only task creator (or admin) can delete a task.

### 1.3 Filtering, Search & Pagination
- [ ] Filtering by `?status=TODO` returns only tasks with `TODO` status.
- [ ] Filtering by `?priority=HIGH` returns only high-priority tasks.
- [ ] Filtering by due date range (`?due_date_after=...` & `?due_date_before=...`) correctly filters task records.
- [ ] Full-text search (`?search=keyword`) matches against `title` and `description`.
- [ ] Response adheres to standard pagination schema (`count`, `next`, `previous`, `results`).

### 1.4 API Documentation & Quality
- [ ] Swagger documentation at `/swagger/` displays all `/api/tasks/` endpoints with complete parameter definitions.
- [ ] Query optimization verified: list view does not trigger N+1 query warnings.
- [ ] Test coverage on `apps.tasks` achieves $\ge 80\%$:
  ```bash
  docker compose exec backend pytest --cov=apps
  # or locally:
  uv run pytest --cov=apps
  ```
- [ ] All pre-commit hooks and Ruff checks pass without errors:
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
