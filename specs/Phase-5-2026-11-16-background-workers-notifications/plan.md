# Plan: Phase 5 – Background Workers & Notifications

## Task Group 1: Notifications Domain & Persistence
- **1.1 Notification App Setup:** Create `apps/notifications/` with `apps.py`, register in `INSTALLED_APPS` in `backend/config/settings.py`.
- **1.2 Notification Model:** Define `Notification` model with fields (`recipient`, `task`, `notification_type`, `title`, `message`, `is_read`, `created_at`) and indexes on `(recipient, is_read)` and `created_at`.
- **1.3 Database Migration:** Generate and apply migration for `notifications` app.

## Task Group 2: Celery Worker Tasks & Beat Scheduling
- **2.1 Assignment Notification Task:** Create `apps/notifications/tasks.py` implementing `send_task_assignment_notification(task_id, recipient_id)`.
- **2.2 Due Date Reminder Task:** Implement `check_due_date_reminders()` in `apps/notifications/tasks.py` with 24-hour lookahead on incomplete tasks and deduplication against prior reminder records.
- **2.3 Celery Beat Schedule:** Configure periodic schedule for `check_due_date_reminders` in `backend/config/settings.py` / `backend/config/celery.py`.
- **2.4 Celery Test Config:** Configure `CELERY_TASK_ALWAYS_EAGER = True` and `CELERY_TASK_EAGER_PROPAGATES = True` in test environment.

## Task Group 3: Task Assignment Signal Integration
- **3.1 Post-Save Signal Handler:** Create `apps/tasks/signals.py` observing `post_save` on `Task`; detect new assignment or assignee change.
- **3.2 Transactional Enqueue:** Wrap Celery task dispatch in `transaction.on_commit` to eliminate race conditions between DB commit and worker retrieval.
- **3.3 Signal Registration:** Connect signal handler in `apps/tasks/apps.py` `ready()` method.

## Task Group 4: In-App Notification REST API
- **4.1 Serializers:** Create `NotificationSerializer` in `apps/notifications/serializers.py`.
- **4.2 ViewSet & Actions:** Create `NotificationViewSet` in `apps/notifications/views.py`:
  - Scoped to `request.user`.
  - Filter for unread notifications (`?unread=true`).
  - Action `mark_read` (`PATCH /api/notifications/{id}/mark-read/` or `PATCH /api/notifications/{id}/`).
  - Action `mark_all_read` (`POST /api/notifications/mark-all-read/`).
- **4.3 URL Routing & Swagger:** Register router in `apps/notifications/urls.py`, mount under `/api/notifications/` in `config/urls.py`, annotate with `drf-yasg`.

## Task Group 5: Test Suite & Verification (TDD)
- **5.1 Notification Model Tests:** Test model creation, defaults, ordering, relationships, and string representation.
- **5.2 Celery Task Tests:** Test `send_task_assignment_notification` and `check_due_date_reminders` (including deduplication check).
- **5.3 Signal Tests:** Test creating and updating task with assignee triggers async task dispatch.
- **5.4 Notification API Tests:** Test list, unread filtering, marking single notification as read, and bulk mark-all-read.
- **5.5 Docker & Live Integration:** Verify Celery worker picks up and processes tasks in Docker environment.
- **5.6 Code Quality & Coverage:** Achieve $\ge 80\%$ test coverage and pass all pre-commit hooks.
