# Plan: Phase 6 – Frontend Foundation & Routing

## Task Group 1: Routing Dependencies & TypeScript Contracts
- **1.1 Dependencies:** Install `react-router-dom` in `frontend/package.json`.
- **1.2 Type Definitions:** Create `frontend/src/types/` with contracts:
  - `auth.ts`: `User`, `LoginCredentials`, `RegisterData`, `AuthTokens`, `AuthResponse`.
  - `notification.ts`: `Notification`, `NotificationResponse`.
  - `task.ts`: `Task`, `TaskStatus`, `TaskPriority`.

## Task Group 2: Axios API Client & JWT Interceptors
- **2.1 Central Client:** Create `frontend/src/api/client.ts` with Axios instance, base URL configuration, and request interceptor attaching JWT Bearer token.
- **2.2 Automatic Refresh Interceptor:** Implement 401 response interceptor with token refresh queue:
  - Calls `POST /api/auth/token/refresh/` with stored refresh token.
  - Updates stored tokens on success and replays original requests.
  - Clears session and redirects to `/login` if refresh fails or token is revoked.

## Task Group 3: Authentication Context & Route Guards
- **3.1 AuthContext:** Create `frontend/src/context/AuthContext.tsx` providing `user`, `login`, `register`, `logout`, `isLoading`, and `isAuthenticated`.
- **3.2 Token Validation Bootstrap:** Fetch `GET /api/auth/me/` on initialization if token exists in `localStorage`.
- **3.3 Route Guards:** Create `frontend/src/components/routing/`:
  - `ProtectedRoute.tsx`: Redirects unauthenticated users to `/login`.
  - `PublicRoute.tsx`: Redirects authenticated users to `/`.

## Task Group 4: Views & Application Layout Shell
- **4.1 Layout Components:** Create `frontend/src/components/layout/`:
  - `Navbar.tsx`: Brand logo, navigation tabs, user avatar badge, logout button, and `NotificationBell`.
  - `NotificationBell.tsx`: Bell icon with unread badge counter, popover showing unread notifications, and "Mark all read" action.
  - `AppLayout.tsx`: Responsive shell wrapping `<Outlet />` with desktop and mobile navigation.
- **4.2 Auth Views:** Create `frontend/src/pages/`:
  - `Login.tsx`: Login form with validation, error banners, and link to register.
  - `Register.tsx`: Registration form with validation, error banners, and link to login.
  - `DashboardPlaceholder.tsx`: Clean dashboard view summarizing tasks and system readiness (ready for Phase 7).
  - `HealthView.tsx`: Integrated Phase 1 health status view.
  - `NotFound.tsx`: 404 error page with navigation back to dashboard.
- **4.3 Router Wiring:** Configure browser router in `frontend/src/App.tsx`.

## Task Group 5: Validation & Verification
- **5.1 Type & Linter Verification:** Run `npm run lint` and `npm run build` (`tsc -b && vite build`) to ensure zero TypeScript and linter errors.
- **5.2 Browser & Integration Check:** Verify clean browser console, successful login, register, token refresh, protected route redirection, and notification popover.
- **5.3 Acceptance Criteria Sign-Off:** Update `validation.md` and commit all Phase 6 work.
