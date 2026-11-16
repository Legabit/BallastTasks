# Validation: Phase 6 – Frontend Foundation & Routing

## 1. Acceptance Criteria
Phase 6 is complete and eligible for merge to `main` when all criteria below are verified.

### 1.1 Routing & Navigation Structure
- [ ] Application navigates without full page reload via `react-router-dom`.
- [ ] Direct navigation to `/` redirects unauthenticated users to `/login`.
- [ ] Direct navigation to `/login` or `/register` redirects authenticated users to `/`.
- [ ] Unknown paths render a friendly 404 Not Found page with navigation back to safety.

### 1.2 Authentication & Session Management
- [ ] Users can log in with valid credentials via `/login` and are directed to the dashboard.
- [ ] Users can register with username, email, and password via `/register` and log in immediately.
- [ ] Invalid credentials display clear inline or banner error messages.
- [ ] Tokens (`access` and `refresh`) persist in `localStorage`.
- [ ] Axios interceptor automatically requests a refreshed access token on HTTP 401 using the refresh token and transparently retries the failed request.
- [ ] Blacklisted or expired refresh tokens clear local storage and redirect to `/login`.
- [ ] User can log out via the user menu in the navbar, clearing credentials and redirecting to `/login`.

### 1.3 Application Layout & Notification Header
- [ ] Responsive `AppLayout` shell renders consistently on desktop, tablet, and mobile screen widths.
- [ ] Top navbar displays logo, route links (`Tasks`, `System Health`), and user profile pill.
- [ ] Notification bell displays real-time unread badge count from `/api/notifications/?unread=true`.
- [ ] Clicking notification bell opens dropdown popover displaying recent notifications.
- [ ] "Mark all as read" button in popover triggers `/api/notifications/mark-all-read/` and resets badge to 0.

### 1.4 Code Quality & Console Health
- [ ] TypeScript compilation (`tsc -b`) and production build (`npm run build`) pass without any errors.
- [ ] No warnings or errors emitted in browser developer console.
- [ ] All pre-commit hooks pass:
  ```bash
  pre-commit run --all-files
  ```

## 2. Verification Commands Checklist
| Step | Command | Expected Result |
| :--- | :--- | :--- |
| **Lint & Format** | `pre-commit run --all-files` | All hooks `Passed`. |
| **Frontend Lint** | `cd frontend && npm run lint` | 0 errors. |
| **TypeScript & Build** | `cd frontend && npm run build` | `dist/` created with 0 errors. |
| **Live Browser UI** | Navigate to `http://localhost:5173` | Redirects to `/login`; clean console. |
| **Login Flow** | Login with `admin@tasks.com` / `adminpassword123` | Dashboard displays with user profile and notification bell. |
| **Notifications Dropdown**| Click bell in navbar | Unread notifications listed; mark read resets badge. |
| **Token Refresh** | Expire access token or clear it | Next API call transparently refreshes token. |
