# Validation: Phase 5 – Background Workers & Notifications

## 1. Acceptance Criteria
Phase 5 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 Asynchronous Background Tasks
- [x] Task assignment (creation or update with assignee) triggers `send_task_assignment_notification` in background.
- [x] Celery task creates a `Notification` record in the database for the assigned recipient.
- [x] `check_due_date_reminders` task scans for tasks due within 24 hours with non-completed status and creates reminder notifications.
- [x] Reminder task deduplicates: does not create duplicate reminder notifications for the same task within the 24-hour reminder window.

### 1.2 In-App Notification REST API
- [x] `GET /api/notifications/` returns a paginated list of notifications for the authenticated user only.
- [x] `GET /api/notifications/?unread=true` filters to only unread notifications.
- [x] `PATCH /api/notifications/{id}/mark-read/` (or `PATCH /api/notifications/{id}/`) marks the notification as read.
- [x] `POST /api/notifications/mark-all-read/` marks all unread notifications for the authenticated user as read.
- [x] Users cannot access or modify other users' notifications (returns HTTP 404 or 403).

### 1.3 System Integration & Quality
- [x] Celery worker container runs cleanly without errors in `docker compose`.
- [x] Celery beat schedule is defined for periodic reminder checks.
- [x] Test coverage across `apps` achieves $\ge 80\%$:
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
| **Unit & Task Tests** | `uv run pytest --cov=apps` | $\ge 80\%$ test coverage, 0 failures. |
| **Container Tests** | `docker compose exec backend pytest --cov=apps` | $\ge 80\%$ coverage inside container. |
| **Worker Health** | `docker compose logs --tail=50 celery_worker` | Celery worker ready and listening on queues. |
| **Live Task Assignment** | `POST /api/tasks/` with assignee | Celery processes job; notification created. |
| **Notifications Endpoint** | `GET /api/notifications/ -H "Authorization: Bearer <token>"` | Notification present in user feed. |
