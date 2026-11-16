# Requirements: Phase 6 – Frontend Foundation & Routing

## 1. Executive Summary & Context
Phase 6 establishes the frontend architecture for the Task Management System using React 19, TypeScript, Vite, Tailwind CSS v4, and `react-router-dom`. Building on the backend APIs delivered in Phases 1–5, this phase provides the foundational client-side infrastructure: typed API client with automatic JWT token refresh on HTTP 401, central authentication context, protected and public route guards, and a responsive base application layout shell featuring user profile state, logout, and an interactive notification bell popover.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Clean separation of concerns (API client, context, layout, components, views); typed interfaces matching OpenAPI/DRF serializers; robust Axios interceptors handling token rotation without infinite request loops.
- **Steve (Marketing):** Modern, visually polished application shell; responsive design for mobile, tablet, and desktop; clean typography and Tailwind styling; zero console errors or warnings.
- **Sid (QA):** Deterministic routing behavior; testable authentication flow; seamless handling of expired tokens, invalid credentials, and unauthorized page transitions.
- **Azim (Security):** Secure token storage management; automatic token invalidation and redirection to `/login` on token blacklist/expiration; route protection preventing unauthenticated access to dashboard views.

## 3. Scope & Deliverables
### In Scope
1. **Routing Setup (`react-router-dom`):**
   - Install `react-router-dom`.
   - Router configuration with routes:
     - `/login`: Public login view (`PublicRoute`).
     - `/register`: Public registration view (`PublicRoute`).
     - `/`: Protected application shell (`ProtectedRoute` wrapping `AppLayout`).
       - `/`: Tasks dashboard view placeholder (ready for Phase 7).
       - `/health`: System health & service status view.
     - `*`: Not Found (404) fallback route.
2. **API Client & Interceptor Layer (`frontend/src/api/client.ts`):**
   - Central Axios instance configured with base URL and default headers.
   - Request interceptor: attaches `Bearer <access_token>` from `localStorage`.
   - Response interceptor: intercepts 401 responses, calls `POST /api/auth/token/refresh/` using refresh token, retries queued requests, and redirects to `/login` if refresh fails or token is blacklisted.
3. **Authentication Context (`frontend/src/context/AuthContext.tsx`):**
   - Manages `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`.
   - Functions: `login(username, password)`, `register(username, email, password)`, `logout()`.
   - Initial bootstrap: validates stored token by querying `GET /api/auth/me/`.
4. **Base Application Layout Shell (`frontend/src/components/layout/`):**
   - `AppLayout`: Responsive container with Navbar and mobile navigation.
   - `Navbar`: Displays logo, navigation links (`Tasks`, `System Health`), user badge with username/email, logout button, and interactive notification bell.
   - `NotificationBell`: Queries `GET /api/notifications/?unread=true`, shows unread badge counter, and toggles a dropdown popover listing recent notifications with a "Mark all as read" button.
5. **Quality & Standards:**
   - Strict TypeScript types for Auth, User, and Notification models.
   - Zero errors and zero warnings in browser console.
   - Production build passes cleanly (`npm run build`).

### Out of Scope
- Full Task CRUD Kanban / Table components, modals, filters, and assignee selectors (Phase 7).
- End-to-end Cypress/Playwright browser automation and GitHub Actions CI (Phase 8).

## 4. Architectural Decisions
| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Routing** | `react-router-dom` with nested layout routes | Standard React SPA routing pattern; cleanly decouples auth guards from view logic. |
| **Session Persistence** | `localStorage` for JWT pair + Axios 401 refresh interceptor | Keeps users authenticated across page refreshes while respecting short 15m access token lifespan. |
| **Layout Shell** | Shared `AppLayout` with header, mobile menu, and notification popover | Provides consistent navigation framework and surfaces Phase 5 notifications immediately. |
| **CSS & Design** | Tailwind CSS v4 + Lucide React icons | Clean, responsive, and lightweight modern design system matching Steve's polish requirements. |
