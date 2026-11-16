# Requirements: Phase 8 – Testing, CI/CD, & Seed Data

## 1. Executive Summary & Context
Phase 8 represents the final integration and delivery phase of the Task Management System. It unifies the system by implementing an idempotent, comprehensive demo seed data management command (`python manage.py seed_data`), establishing a robust GitHub Actions automated CI/CD pipeline enforcing code quality and test coverage ($\ge 80\%$), consolidating end-to-end documentation in `README.md`, and delivering the required `GENAI_DOCUMENTATION.md` fulfilling all stakeholder criteria (Mary, Steve, Sid, Azim) and interview exercise brief expectations.

## 2. Stakeholder Alignment
- **Mary (Engineering):** Single-command developer ergonomics (`docker compose up` + `seed_data`); reproducible CI verification across Python 3.12, PostgreSQL, Redis, and React; Clean Architecture adherence documented.
- **Steve (Marketing):** Realistic, professional demo dataset showcasing all 5 status columns on the Kanban board, priority levels with color badges, overdue tasks, and notifications.
- **Sid (QA):** Strict coverage threshold enforced in CI ($\ge 80\%$ minimum, currently $\ge 95\%$); deterministic seed credentials; test verification steps documented.
- **Azim (Security):** Clean separation of demo credentials; no hardcoded production secrets in repository; dependency scanning considerations; OWASP Top 10 compliance summary.

## 3. Scope & Deliverables
### In Scope
1. **Idempotent Seed Data Command (`backend/apps/tasks/management/commands/seed_data.py`):**
   - Populates realistic demo users:
     - `admin@tasks.com` (Superuser / Admin)
     - `mary.engineer@tasks.com` (Engineering Lead)
     - `steve.marketing@tasks.com` (Product / Marketing)
     - `sid.qa@tasks.com` (QA Specialist)
     - `azim.security@tasks.com` (Security Architect)
   - Populates 15+ diverse tasks across all 5 statuses (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`) and 4 priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), with upcoming, past, and null due dates.
   - Populates realistic notifications (`ASSIGNMENT` and `DUE_DATE_REMINDER`) with read and unread states.
   - Idempotent: safe to run repeatedly without creating duplicates.
2. **GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`):**
   - Triggered on `push` and `pull_request` to `main`.
   - Backend Job:
     - Setup Python 3.12 with `uv`.
     - Run `pre-commit run --all-files` (Ruff formatting, linting, file cleanliness).
     - Run `pytest --cov=apps --cov-fail-under=80`.
   - Frontend Job:
     - Setup Node.js 20 with caching.
     - Run `npm ci`.
     - Run `npm run lint` (`oxlint`).
     - Run `npm run build` (`tsc -b && vite build`).
3. **Comprehensive Project `README.md`:**
   - Quick start guide (`docker compose up`).
   - Architecture summary (Clean Architecture, DRF, React, Celery, Redis).
   - Demo credentials list.
   - Running test suites & linting commands.
   - API documentation access (`/swagger/`).
4. **Technical Interview GenAI Section (`GENAI_DOCUMENTATION.md`):**
   - Prompt engineering methodology and prompts used.
   - Representative generated code excerpts.
   - Systematic validation process (TDD, test coverage, static analysis, container execution).
   - Corrections, edge cases handled, security hardening, and performance reviews (N+1 query prevention, token blacklisting).

### Out of Scope
- Production cloud infrastructure deployment (AWS ECS / GCP Cloud Run).
- Paid third-party alerting integrations (Slack/PagerDuty webhooks).

## 4. Architectural Decisions
| Area | Decision | Rationale |
| :--- | :--- | :--- |
| **Data Seeding** | Custom Django management command (`seed_data`) | Native Django command; allows dynamic date calculations (relative to `timezone.now()`) and clean password hashing. |
| **CI Automation** | GitHub Actions multi-job workflow | Free, fast, industry standard; runs in parallel for rapid feedback on pull requests. |
| **Coverage Gate** | `--cov-fail-under=80` enforced in CI | Guarantees Sid's QA requirement ($\ge 80\%$ coverage) is permanently enforced. |
| **GenAI Artifact** | Dedicated `GENAI_DOCUMENTATION.md` | Provides an extensive, structured audit trail satisfying technical interview brief evaluation criteria. |
