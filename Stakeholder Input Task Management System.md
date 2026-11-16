# Stakeholder Input: Task Management System

## 1. Purpose and Scope

This document captures stakeholder input for a simple task management system and translates it into requirements, priorities, and acceptance criteria. It combines two sources:

- The **Python Technical Interview Exercise** brief (the baseline scope).
- Direct input from four internal stakeholders: **Mary** (Engineering), **Steve** (Marketing), **Sid** (QA), and **Azim** (Security).

**In scope:** a RESTful API and a React frontend that let users create, read, update, and delete tasks, assign tasks to users, mark tasks complete, and filter tasks by status and due date.

**Out of scope (for this phase):** native mobile apps, third-party integrations, advanced reporting, and multi-tenant administration.

## 2. Project Context (from the Exercise Brief)

The brief sets these fixed expectations, which all stakeholder input must fit within:

- **Backend:** Django (Django REST Framework); CRUD endpoints; JWT authentication; pagination; filtering by status and due date.
- **Database:** PostgreSQL  with a simple schema for tasks and users.
- **Testing:** unit tests with pytest/unittest and at least 80% coverage.
- **Delivery:** Dockerfile and docker-compose.yml; README with setup steps and key decisions; Swagger/drf-yasg API docs; pyproject.toml (poetry or uv) and pre-commit.
- **Also required:** rate limiting and background task processing (e.g., Celery + Redis).
- **Frontend:** React; responsive and user-friendly; full CRUD; cleanly structured components and state.
- **Submission:** seeded demo data and credentials.
- **Generative AI section:** the prompt used, representative output code, and how the output was validated, corrected, hardened for edge cases and auth, and assessed for performance and idiomatic quality.
- **Evaluation criteria:** Clean Architecture, application testing (TDD preferred), code quality, functionality (no browser console warnings desired), presentation, and GenAI fluency.

## 3. Stakeholder Register

| Stakeholder | Role | Primary interest | Influence | Interest level |
| --- | --- | --- | --- | --- |
| Mary | Engineering | Reliable, maintainable build on a popular stack (Python/Django + React) | High | High |
| Steve | Marketing | Attractive, polished site that works well in modern browsers | Medium | High |
| Sid | QA | Extensive testing in every phase | High | High |
| Azim | Security | A robust, secure site that safely handles sensitive data | High | High |
| Interview panel | Evaluators (from the brief) | Clean Architecture, quality, functionality, GenAI fluency | High | High |
| End users | People managing and completing tasks (implied) | Fast, simple, trustworthy task tracking | Medium | High |

*The interview panel and end users are inferred from the brief and should be confirmed.*

## 4. Stakeholder Input in Detail

### 4.1 Mary – Engineering

**Stated need:** a reliable site using a popular stack, with Python and Django for the backend and React for the frontend.

**Interpreted requirements:**

- Use Django with Django REST Framework for the API, and React for the UI.
- Favor mature, widely supported libraries (e.g., simplejwt for JWT, Celery + Redis for background jobs, drf-yasg for API docs).
- Structure the code with Clean Architecture: separate domain logic, use cases, and infrastructure so the framework is replaceable.
- Use a clean React structure: components, hooks, API client layer, and a clear state approach.
- Ensure reproducible environments via Docker, a lockfile, and a pinned dependency manager (poetry or uv).
- Enforce code quality via pre-commit hooks (formatter, linter, type checks).

**Success looks like:** a new engineer can clone the repo, run one command, and have a working app plus tests within minutes.

**Concerns:** over-engineering a simple domain; framework logic leaking into business rules.

### 4.2 Steve – Marketing

**Stated need:** an attractive site that works well on modern browsers.

**Interpreted requirements:**

- Consistent visual design: typography, color palette, spacing, and iconography applied through a shared design system or component library.
- Responsive layout for desktop, tablet, and phone.
- Support for current versions of Chrome, Edge, Firefox, and Safari.
- Clear empty, loading, and error states; smooth, non-distracting transitions.
- Fast perceived performance (target: first meaningful content in under 2 seconds on a typical connection).
- No warnings or errors in the browser console (also a brief criterion).
- Accessibility basics (contrast, keyboard navigation, semantic HTML) so the polish does not exclude users.

**Success looks like:** the demo looks professional on a laptop and on a phone without any visual glitches.

**Concerns:** a functional but plain interface that undersells the product.

### 4.3 Sid – QA

**Stated need:** lots of testing in every phase.

**Interpreted requirements:**

- Treat the brief's 80% coverage as a floor, not a goal; aim higher on domain and use-case layers.
- Apply TDD where practical (preferred by the brief): write failing tests, then implement.
- Test at every level: unit, integration (API plus database), contract (against the OpenAPI schema), end-to-end (browser), plus non-functional checks.
- Gate every merge on automated tests in CI; block merges that lower coverage.
- Provide seeded, deterministic test data and a documented test plan.
- Track defects and test results per phase.

**Success looks like:** every requirement maps to at least one automated test, and the suite runs green in CI and in Docker.

**Concerns:** tests added late; flaky tests; untested edge cases such as invalid dates, reassignment, and permission boundaries.

### 4.4 Azim – Security

**Stated need:** a robust site, because it will handle a lot of sensitive data.

**Interpreted requirements:**

- Authentication: JWT with short-lived access tokens, refresh token rotation, and token revocation on logout.
- Authorization: object-level permissions so users see and change only what they are permitted to (for example, a task's owner or assignee).
- Passwords hashed with a strong algorithm (Django's default PBKDF2 or Argon2), with validation rules and lockout or throttling on repeated failures.
- Rate limiting on all endpoints, with stricter limits on login and token refresh.
- Strict input validation and output encoding; protection against injection, XSS, CSRF (where applicable), and mass assignment.
- Transport security: HTTPS everywhere, HSTS, secure headers, and a restrictive CORS policy.
- Secrets in environment variables, never in the repository; separate dev and prod settings with DEBUG off in production.
- Encryption at rest for sensitive fields and database storage; backups encrypted.
- Audit logging of authentication events and task changes, without logging sensitive values.
- Dependency and image scanning (e.g., pip-audit, npm audit, container scanning) in CI.

**Success looks like:** no high-severity findings in a basic security review, and an OWASP Top 10 checklist passed.

**Concerns:** SQLite and default configurations are weak for sensitive data; background workers and Redis exposed without authentication.

## 5. Consolidated Requirements

Priority uses MoSCoW: **M** = must, **S** = should, **C** = could.

### 5.1 Functional

| ID | Requirement | Source | Priority |
| --- | --- | --- | --- |
| FR-01 | Users can register and log in; login returns JWT access and refresh tokens | Brief, Azim | M |
| FR-02 | Users can create, read, update, and delete tasks | Brief | M |
| FR-03 | Users can assign a task to another user | Brief | M |
| FR-04 | Users can mark a task as completed (and reopen it) | Brief | M |
| FR-05 | Task list supports filtering by status and due date (including a date range) | Brief | M |
| FR-06 | Task list is paginated | Brief | M |
| FR-07 | Frontend provides full CRUD, assignment, completion, and filtering | Brief, Mary | M |
| FR-08 | Background job sends a notification (or reminder) when a task is assigned or nearing its due date | Brief | M |
| FR-09 | Seeded demo data and credentials are provided | Brief | M |
| FR-10 | Sorting and text search on the task list | Steve | C |

### 5.2 Non-Functional

| ID | Requirement | Source | Priority |
| --- | --- | --- | --- |
| NFR-01 | Backend built with Django and DRF; frontend built with React | Mary | M |
| NFR-02 | Clean Architecture: domain, use cases, and infrastructure separated | Brief, Mary | M |
| NFR-03 | PostgreSQL used for the Docker environment (SQLite acceptable for quick local tests only) | Brief, Azim | M |
| NFR-04 | Rate limiting on all API endpoints; stricter on authentication | Brief, Azim | M |
| NFR-05 | Object-level authorization on every task endpoint | Azim | M |
| NFR-06 | HTTPS-ready configuration, secure headers, restrictive CORS, secrets via environment variables | Azim | M |
| NFR-07 | Test coverage of at least 80% overall, with higher targets on domain and use-case layers | Brief, Sid | M |
| NFR-08 | Automated CI running linting, tests, coverage gate, and dependency scanning on every change | Sid, Azim, Mary | M |
| NFR-09 | Responsive UI, working on current Chrome, Edge, Firefox, and Safari | Steve | M |
| NFR-10 | No errors or warnings in the browser console | Brief, Steve | S |
| NFR-11 | Accessible UI (WCAG 2.1 AA basics) | Steve | S |
| NFR-12 | API documented via drf-yasg (Swagger) and kept in sync with the code | Brief | M |
| NFR-13 | Dockerfile and docker-compose.yml start API, database, Redis, Celery worker, and frontend | Brief, Mary | M |
| NFR-14 | README with setup, architecture decisions, and test instructions; pyproject.toml and pre-commit configured | Brief, Mary | M |
| NFR-15 | Audit logging of authentication events and task changes | Azim | S |
| NFR-16 | Encryption at rest for sensitive fields | Azim | C |

## 6. Conflicts and Trade-offs

| Tension | Stakeholders | Recommended resolution |
| --- | --- | --- |
| Attractive polish vs. a simple, maintainable codebase | Steve vs. Mary | Use an established React component library with a small custom theme instead of bespoke UI. This gives a polished look with little custom code. |
| Extensive testing vs. delivery speed | Sid vs. Mary | Adopt TDD for the domain and API layers; keep end-to-end tests focused on critical user journeys. Run fast tests on every commit and the full suite in CI. |
| Robust security vs. simple setup | Azim vs. Mary | Provide secure defaults in docker-compose (PostgreSQL, authenticated Redis, non-root containers) with a single command to start. Document production hardening steps separately. |
| SQLite allowed by the brief vs. sensitive data | Azim vs. Brief | Use PostgreSQL in Docker and CI. Allow SQLite only for lightweight local unit tests. |
| Rate limiting vs. a smooth user experience | Azim vs. Steve | Set generous limits for normal use, strict limits on login, and show clear, friendly messages when a limit is reached. |

## 7. Testing Strategy by Phase (Sid)

| Phase | Testing activities | Exit criteria |
| --- | --- | --- |
| Requirements | Review requirements for testability; define acceptance criteria | Every requirement has at least one acceptance test |
| Design | Review architecture and API contract; threat modeling | Contract and threat model reviewed and approved |
| Backend build | TDD unit tests; integration tests with a real database; permission tests; pagination and filter edge cases | Coverage above 80% overall and no failing tests |
| Frontend build | Component tests; accessibility checks; cross-browser checks | No console warnings; key components tested |
| Integration | Contract tests against the OpenAPI schema; end-to-end tests of core journeys | All critical journeys pass in Docker |
| Security | Dependency and image scans; OWASP Top 10 review; authentication and authorization abuse tests | No high or critical findings open |
| Release | Regression run; smoke test of seeded demo; performance sanity check | Demo runs cleanly from a fresh clone |

## 8. Security Checklist (Azim)

- Short-lived access tokens, refresh rotation, and blacklist on logout.
- Object-level permission checks tested for every endpoint (read, update, delete, assign).
- Strong password hashing and password validators; throttled login.
- Serializer-level validation for every field (titles, dates, status values, assignee IDs).
- Parameterized queries only (Django ORM); no raw SQL with user input.
- Secure headers (HSTS, content type options, frame options) and a strict CORS allow-list.
- Redis and Celery not exposed publicly; broker credentials set.
- Containers run as a non-root user with minimal base images.
- Secrets loaded from environment variables; a sample .env file contains no real credentials.
- Logs exclude tokens, passwords, and personal data.

## 9. Traceability to the Brief

| Brief requirement | Covered by | Stakeholder(s) |
| --- | --- | --- |
| CRUD endpoints | FR-02, FR-03, FR-04 | Mary |
| JWT authentication | FR-01, NFR-05 | Azim |
| Pagination and filtering | FR-05, FR-06 | Mary, Sid |
| PostgreSQL or SQLite | NFR-03 | Azim |
| Unit tests, 80% coverage | NFR-07, NFR-08 | Sid |
| Docker | NFR-13 | Mary |
| README, API docs, tooling | NFR-12, NFR-14 | Mary |
| Rate limiting | NFR-04 | Azim |
| Background tasks | FR-08 | Mary |
| Responsive, user-friendly frontend | FR-07, NFR-09, NFR-11 | Steve |
| Seeded data and credentials | FR-09 | Sid |
| Clean Architecture | NFR-02 | Mary |
| No console warnings | NFR-10 | Steve |
| GenAI documentation | Section 11 | Mary |

## 10. Acceptance Criteria (Summary)

- A user can sign up or log in with the seeded credentials, then create, edit, assign, complete, and delete tasks from the UI.
- Filtering by status and by due date returns correct, paginated results.
- A user cannot read or modify tasks they are not permitted to access; the API returns the correct error code.
- Exceeding the rate limit returns a 429 response and the UI shows a clear message.
- Assigning a task triggers a background job that completes successfully.
- The test suite passes with at least 80% coverage, and CI is green.
- The UI is usable on a phone-sized and a desktop-sized screen in current Chrome, Edge, Firefox, and Safari, with a clean browser console.
- Running docker compose up on a fresh clone starts every service and loads the demo data.
- Swagger documentation lists every endpoint and matches actual behavior.

## 11. GenAI Component (from the Brief)

To satisfy the brief's GenAI section, record the following in the repository:

- **Prompt:** the exact prompt used with the chosen AI coding tool, including stack, architecture style, security, and testing constraints drawn from this document.
- **Output sample:** a representative excerpt of the generated code.
- **Validation notes:** how the output was checked (tests first, code review, linting, manual API testing, scanner results).
- **Corrections:** what was changed or rejected, and why.
- **Edge cases and authentication:** examples such as invalid due dates, reassigning a completed task, expired tokens, and cross-user access attempts.
- **Performance and idiom review:** query counts (avoiding N+1 queries), indexes on status and due date, and adherence to Django and React conventions.
