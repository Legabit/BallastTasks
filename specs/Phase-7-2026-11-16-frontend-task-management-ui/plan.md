# Plan: Phase 7 – Frontend Task Management UI

## Task Group 1: Backend User Directory & Client API Extensions
- **1.1 User Directory Endpoint:** Implement `UserListView` (`GET /api/auth/users/`) in `backend/apps/authentication/views.py` returning `id`, `username`, `email` for authenticated requests. Add swagger annotations and mount in `urls.py`.
- **1.2 Unit & API Tests:** Add tests for `/api/auth/users/` in `backend/tests/test_auth.py` verifying authenticated access and exclusion of passwords.
- **1.3 Frontend Task API Layer:** Create `frontend/src/api/tasks.ts` with typed helpers:
  - `getTasks(params)`: supports status, priority, due date filters, search, ordering, and pagination.
  - `getTask(id)`: retrieves single task.
  - `createTask(payload)`: creates new task.
  - `updateTask(id, payload)`: full or partial update.
  - `deleteTask(id)`: deletes task.
  - `getUsers()`: fetches user directory for assignee dropdown.

## Task Group 2: Modals & Form Components
- **2.1 Task Form Modal:** Create `frontend/src/components/tasks/TaskModal.tsx`:
  - Handles both "Create Task" and "Edit Task".
  - Form validation: title required, due date parsing, status and priority choices.
  - Assignee selector: dropdown populated via `getUsers()`.
  - Error alert banner for server validation rejections.
- **2.2 Delete Confirmation Dialog:** Create `frontend/src/components/tasks/DeleteTaskModal.tsx`:
  - Accessible modal dialog confirming deletion intent.
  - Disables delete for unauthorized users.

## Task Group 3: Filter Bar & Dual Views (Kanban & List)
- **3.1 Filter Bar Component:** Create `frontend/src/components/tasks/TaskFilterBar.tsx`:
  - Search input with debounce / submit.
  - Status filter dropdown (`ALL`, `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`).
  - Priority filter dropdown (`ALL`, `LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Due date filters (after, before).
  - Quick filters: "Assigned to Me", "Created by Me".
  - Clear / Reset filters button.
  - View switcher toggle buttons (Kanban icon vs Table icon).
- **3.2 Kanban Board View:** Create `frontend/src/components/tasks/TaskKanban.tsx`:
  - 5 Status columns: Backlog, To Do, In Progress, In Review, Completed.
  - Task card component (`TaskCard.tsx`) with priority badge, due date warning, assignee avatar, completion checkbox, and edit/delete actions.
  - Column status changer dropdown on cards to quickly move tasks between columns.
- **3.3 Table / List View:** Create `frontend/src/components/tasks/TaskList.tsx`:
  - Responsive table with sorting on headers.
  - Inline completion toggle checkbox.
  - Status pill, priority badge, due date, assignee, and action buttons.

## Task Group 4: Task Dashboard View & Route Integration
- **4.1 Task Dashboard View:** Replace placeholder in `frontend/src/pages/TaskDashboard.tsx`:
  - Orchestrates tasks state, filter state, pagination, and modal state.
  - Connects optimistic completion toggle with error rollback.
  - Handles task creation, update, and deletion with instant list refresh.
- **4.2 Route Wiring:** Mount `TaskDashboard` at route `/` in `frontend/src/App.tsx`.

## Task Group 5: Validation & Quality Sign-Off
- **5.1 Test Suite & Coverage:** Run backend pytest (`uv run pytest --cov=apps`) verifying $\ge 80\%$ coverage.
- **5.2 Frontend Build & Lint:** Run `npm run lint` and `npm run build` in `frontend/` ensuring zero errors.
- **5.3 Browser Verification:** Test full CRUD in browser, one-click completion, filter combinations, and verify clean console.
- **5.4 Sign-off & Commit:** Update `validation.md` and commit all Phase 7 work.
