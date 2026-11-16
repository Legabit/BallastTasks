# Plan: Phase 4 – Task CRUD & API Endpoints

## Task Group 1: Filter & Serialization Foundation
- **1.1 Dependencies & Installed Apps:** Verify or add `django-filter` to `backend/pyproject.toml` and register in `INSTALLED_APPS` and `REST_FRAMEWORK` default filter backends.
- **1.2 Serializers Implementation:** Implement `TaskSerializer`, `TaskCreateSerializer`, and `TaskUpdateSerializer` in `apps/tasks/serializers.py` with validation and field mappings.
- **1.3 FilterSet Definition:** Implement `TaskFilter` in `apps/tasks/filters.py` supporting filtering by `status`, `priority`, `due_date` range (`due_date__gte`, `due_date__lte`), `assignee`, and creator.

## Task Group 2: Object-Level Permissions & ViewSet
- **2.1 Permissions Implementation:** Create `apps/tasks/permissions.py` with `IsTaskOwnerOrAssignee` (read access for creator/assignee; write/delete restricted to creator).
- **2.2 TaskViewSet Implementation:** Create `apps/tasks/views.py` implementing `TaskViewSet` with:
  - Scoped queryset (`creator == user | assignee == user`).
  - Optimized queries (`select_related("creator", "assignee")`).
  - Integration with domain services (`create_task`, `update_task`).
  - Pagination class (`StandardResultsSetPagination`).
  - Filter backends (`DjangoFilterBackend`, `SearchFilter`, `OrderingFilter`).
- **2.3 URL Routing:** Register `TaskViewSet` with DRF `DefaultRouter` in `apps/tasks/urls.py` and mount at `/api/tasks/`.

## Task Group 3: Swagger / OpenAPI Documentation
- **3.1 Swagger Auto-Schema Annotations:** Annotate `TaskViewSet` CRUD actions with `drf-yasg` decorators for query parameter descriptions and response codes.
- **3.2 API Schema Verification:** Verify `/swagger/` displays complete CRUD schema under `Tasks` tag with filter documentation.

## Task Group 4: Test Suite & Quality Assurance (TDD)
- **4.1 CRUD Contract Tests:** Write tests for `list`, `retrieve`, `create`, `update`, `partial_update`, and `destroy` endpoints.
- **4.2 Filter & Search Tests:** Test status filtering, priority filtering, due date range filtering, search terms, and ordering.
- **4.3 Permission & Security Tests:** Test cross-user authorization (user cannot see or modify other users' private tasks; 403/404 responses verified).
- **4.4 Pagination Tests:** Test page navigation, custom page sizes, and edge boundaries.
- **4.5 Coverage & Pre-commit Verification:** Confirm $\ge 80\%$ test coverage and pass all pre-commit hooks.
