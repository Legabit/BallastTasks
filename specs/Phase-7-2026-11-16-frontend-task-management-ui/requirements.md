# Requirements: Phase 7 – Frontend Task Management UI

## 1. Executive Summary & Context
Phase 7 delivers the core user-facing Task Management UI. Building on the routing and authentication foundation established in Phase 6 and the CRUD/Notification APIs from Phases 4 & 5, this phase implements a dual-view Task Dashboard (Kanban Board & Data Table list view), task creation and editing modals with dynamic assignee selection via `/api/auth/users/`, one-click completion toggles, real-time filtering (by status, priority, due date range, and assignment), text search, and deletion confirmation dialogs.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Clean component hierarchy, reusable modal primitives, typed form hooks/state, optimistic UI updates for completion toggles with rollbacks on failure, zero console warnings.
- **Steve (Marketing):** Attractive, modern UI with smooth transitions; interactive Kanban board layout with status columns; clear priority badges (Low, Medium, High, Urgent); responsive mobile and desktop viewports.
- **Sid (QA):** Comprehensive UI testability; verified filtering combinations (status, priority, due date range); validation error handling on forms; prevention of illegal mutations (e.g. unassigned users attempting deletions).
- **Azim (Security):** Client-side permission enforcement matching backend rules (e.g., only creators/admins see delete actions; assignees can update status/progress but not delete or reassign); sanitization of task inputs.

## 3. Scope & Deliverables
### In Scope
1. **Backend User Directory Support:**
   - Add `GET /api/auth/users/` endpoint in `backend/apps/authentication/views.py` returning lightweight user list (`id`, `username`, `email`) for authenticated users to populate assignee selection.
2. **Task Dashboard (`frontend/src/pages/TaskDashboard.tsx`):**
   - View mode switcher: Toggle between **Kanban Board** and **Table / List View**.
   - Filter bar:
     - Search input (text search against `title` & `description`).
     - Status multi-select / dropdown filter.
     - Priority dropdown filter (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
     - Due date filter (date picker / range).
     - "Assigned to Me" / "Created by Me" quick toggle pills.
     - Reset filters button.
   - Header action: "+ New Task" button opening creation modal.
3. **Interactive Kanban Board View (`frontend/src/components/tasks/TaskKanban.tsx`):**
   - 5 Status Columns: `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`.
   - Task Cards displaying:
     - Title & description excerpt.
     - Priority pill badge with color coding.
     - Due date with overdue warning indicator.
     - Assignee avatar badge.
     - Quick completion toggle checkbox.
     - Card action menu (Edit, Delete).
4. **Data Table / List View (`frontend/src/components/tasks/TaskList.tsx`):**
   - Structured columns: Checkbox / Completion, Title & Description, Status pill, Priority pill, Due Date, Assignee, Actions.
   - Sorting by column headers (due date, priority, created at, status).
5. **Task Modals (`frontend/src/components/tasks/TaskModal.tsx`):**
   - Unified Create / Edit Modal:
     - Fields: Title (required), Description, Status, Priority, Due Date (datetime-local picker), Assignee (searchable selector).
     - Inline validation and server error handling.
   - Delete Confirmation Modal:
     - Warning dialog with task title and confirm/cancel buttons.
6. **One-Click Completion Toggle:**
   - Checking a task card/row immediately updates status to `COMPLETED` via API `PATCH /api/tasks/{id}/`.
   - Unchecking reverts status to `TODO` or `IN_PROGRESS`.
   - Optimistic UI state update with error rollback.
7. **Zero Console Warnings:**
   - Strict adherence to React 19 standards, accessible HTML attributes, and clean DOM rendering.

### Out of Scope
- Drag-and-drop third-party library bloat (native clean column moves or status dropdowns preferred).
- GitHub Actions CI workflow pipeline (Phase 8).
- Database seeding scripts (Phase 8).

## 4. Architectural Decisions
| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Presentation Mode** | Dual-view toggle (Kanban & Table) with state persistence | Satisfies both visual workflow preference (Steve) and dense data scanning (Mary). |
| **Assignee Directory** | `/api/auth/users/` authenticated endpoint | Provides reliable user candidate lookup for modals without exposing sensitive credentials. |
| **Completion Flow** | Optimistic toggle on card/row | Instant user feedback without requiring full modal interaction. |
| **State Management** | React hooks (`useState`, `useCallback`, `useMemo`) + centralized API layer | Lightweight and straightforward; avoids unnecessary global store dependencies. |
