from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, viewsets

from .filters import TaskFilter
from .models import Task
from .pagination import TaskPagination
from .permissions import IsTaskParticipantOrCreator
from .serializers import TaskCreateUpdateSerializer, TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Task Management:
    - Lists tasks where authenticated user is creator or assignee.
    - Creates tasks with creator set to authenticated user.
    - Updates tasks according to object-level permissions.
    - Deletes tasks (creator only).
    """

    permission_classes = [permissions.IsAuthenticated, IsTaskParticipantOrCreator]
    pagination_class = TaskPagination
    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "created_at", "priority", "status", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()

        if user.is_staff or user.is_superuser:
            qs = Task.objects.all()
        else:
            qs = Task.objects.filter(Q(creator=user) | Q(assignee=user))

        return qs.select_related("creator", "assignee")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return TaskCreateUpdateSerializer
        return TaskSerializer

    @swagger_auto_schema(
        operation_description="List tasks accessible to authenticated user",
        responses={200: TaskSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new task with caller as creator",
        request_body=TaskCreateUpdateSerializer,
        responses={201: TaskSerializer(), 400: "Validation Error"},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve task by ID",
        responses={200: TaskSerializer(), 403: "Forbidden", 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update all fields of a task",
        request_body=TaskCreateUpdateSerializer,
        responses={200: TaskSerializer(), 400: "Bad Request", 403: "Forbidden"},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a task",
        request_body=TaskCreateUpdateSerializer,
        responses={200: TaskSerializer(), 400: "Bad Request", 403: "Forbidden"},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a task (creator or admin only)",
        responses={204: "No Content", 403: "Forbidden", 404: "Not Found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
