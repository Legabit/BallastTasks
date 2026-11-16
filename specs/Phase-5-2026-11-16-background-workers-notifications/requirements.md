# Requirements: Phase 5 – Background Workers & Notifications

## 1. Executive Summary & Context
Phase 5 implements asynchronous background processing and notifications using Celery and Redis. When tasks are assigned to users, a background job delivers notifications. Additionally, scheduled or periodic background tasks evaluate upcoming deadlines and dispatch due-date reminders for tasks approaching their due date within 24 hours. Notifications are persisted in a database `Notification` model with read/unread status (queryable via REST API) and logged to worker output.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Decoupled async job execution via Celery worker + Redis broker; clean Celery task signatures; transactional safety using `transaction.on_commit` so workers only process committed database records.
- **Steve (Marketing):** User notification feed capability supporting read/unread indicators for an engaging and responsive UI experience in subsequent phases.
- **Sid (QA):** Comprehensive test suite ($\ge 80\%$ test coverage) testing task assignment signal emission, Celery task execution (using eager mode in tests), periodic due-date reminder scanning, deduplication logic, and notification API queries.
- **Azim (Security):** Secure Redis connection parameters; scoped notification endpoints ensuring users only view and update their own notifications; sanitization of notification messages.

## 3. Scope & Deliverables
### In Scope
1. **Notification Domain & Persistence (`apps.notifications`):**
   - `Notification` model: `recipient` (FK User), `task` (FK Task, nullable on delete or cascade/set null), `notification_type` (`ASSIGNMENT`, `DUE_DATE_REMINDER`), `title`, `message`, `is_read` (boolean, default False), `created_at`.
   - Migration for `apps.notifications` in PostgreSQL.
2. **Asynchronous Celery Tasks (`apps.notifications.tasks`):**
   - `send_task_assignment_notification(task_id, recipient_id)`: Async Celery task creating a `Notification` record and logging/dispatching notification.
   - `check_due_date_reminders()`: Celery task querying incomplete tasks with `due_date` within the next 24 hours, creating reminder notifications while deduplicating so duplicate alerts are not sent within the reminder window.
3. **Event Triggering via Django Signals (`apps.tasks.signals`):**
   - `post_save` signal on `Task`: detects when `assignee` is set or changed on a task, and dispatches `send_task_assignment_notification` via `transaction.on_commit`.
4. **REST API for In-App Notifications (`/api/notifications/`):**
   - `GET /api/notifications/`: List notifications for authenticated user, ordered by `created_at` descending, with filter for unread (`?unread=true`).
   - `PATCH /api/notifications/{id}/`: Mark notification as read (`is_read=True`).
   - `POST /api/notifications/mark-all-read/`: Bulk mark all unread notifications as read for current user.
5. **Periodic Scheduling Configuration:**
   - Celery Beat schedule configuration in `config/celery.py` or `config/settings.py` scheduling `check_due_date_reminders` periodically.
6. **Testing & Validation:**
   - Unit and integration tests for Celery tasks, signals, reminder deduplication, and notification API endpoints ($\ge 80\%$ coverage).

### Out of Scope
- External SMTP / live email delivery (console / DB delivery fulfills requirements without third-party email service credentials).
- Push notifications / WebSockets (reserved for future enhancements).
- Frontend UI components for notification center (Phase 6 & 7).

## 4. Architectural Decisions
| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Notification Storage** | In-app `Notification` database model | Enables persistent user notification history and clean REST API integration for frontend. |
| **Trigger Mechanism** | Django `post_save` signal with `transaction.on_commit` | Decouples assignment logic while guaranteeing the database transaction is committed before the Celery worker queries it. |
| **Due-Date Scanner** | Celery beat scheduled task (`check_due_date_reminders`) | Scans database periodically for incomplete tasks due within 24 hours; deduplicates using existing notifications within the window. |
| **Worker Testing** | `CELERY_TASK_ALWAYS_EAGER = True` in test settings | Guarantees deterministic, fast test execution without depending on external Redis state during test runs. |
