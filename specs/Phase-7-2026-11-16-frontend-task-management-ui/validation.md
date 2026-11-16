# Validation: Phase 7 – Frontend Task Management UI

## 1. Acceptance Criteria
Phase 7 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 Task Dashboard & Views
- [ ] Dashboard renders at `/` with dual-view toggle: **Kanban Board** and **Data Table List**.
- [ ] Kanban Board displays 5 status columns (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`).
- [ ] Data Table view displays tasks with sortable column headers, status badges, priority badges, and due dates.
- [ ] View preference toggles smoothly without page reload or state disruption.

### 1.2 Task CRUD Operations in UI
- [ ] User can click "+ New Task", fill out title, description, status, priority, due date, and select an assignee from the dropdown, and create a task.
- [ ] Newly created task immediately appears in the dashboard and triggers assignment notifications in Celery worker if assigned.
- [ ] User can click "Edit" on a task, modify fields, and save changes.
- [ ] User can click "Delete" on a task they created, confirm via dialog, and remove the task.
- [ ] Users cannot delete tasks they did not create (button disabled or hidden).

### 1.3 One-Click Completion Toggle
- [ ] Clicking completion checkbox on card or table row immediately transitions task to `COMPLETED`.
- [ ] Unchecking a completed task transitions it back to `TODO` or `IN_PROGRESS`.
- [ ] Completion toggle updates UI optimistically and rolls back if network request fails.

### 1.4 Filtering & Search Capabilities
- [ ] Text search filters tasks matching title or description.
- [ ] Status filter isolates tasks by status.
- [ ] Priority filter isolates tasks by priority level.
- [ ] Due date filter isolates tasks within the chosen range.
- [ ] Quick filters ("Assigned to Me", "Created by Me") filter tasks correctly.
- [ ] "Reset Filters" restores full task list.

### 1.5 Quality, Coverage & Console Health
- [ ] Backend test suite achieves $\ge 80\%$ coverage across all apps:
  ```bash
  docker compose exec backend pytest --cov=apps
  # or locally:
  uv run pytest --cov=apps
  ```
- [ ] Frontend build succeeds cleanly:
  ```bash
  cd frontend && npm run build
  ```
- [ ] Browser developer console contains **zero warnings and zero errors**.
- [ ] All pre-commit hooks pass:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result |
| :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. |
| **Backend Tests** | `uv run pytest --cov=apps` | $\ge 80\%$ test coverage, 0 failures. |
| **Frontend Lint & Build** | `cd frontend && npm run lint && npm run build` | 0 errors. |
| **Live UI CRUD** | Create, edit, complete, and delete task in browser | All operations reflect in UI and API. |
| **Console Check** | Inspect browser console at `http://localhost:5173` | Zero warnings or errors. |
