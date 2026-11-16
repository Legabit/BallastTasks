from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Endpoints for authenticated user to manage in-app notifications."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user).select_related("task")
        unread = self.request.query_params.get("unread")
        if unread is not None and unread.lower() in ("true", "1"):
            qs = qs.filter(is_read=False)
        return qs

    @swagger_auto_schema(
        operation_description="List notifications for authenticated user. Supports ?unread=true",
        manual_parameters=[
            openapi.Parameter(
                "unread",
                openapi.IN_QUERY,
                description="Filter to unread notifications only",
                type=openapi.TYPE_BOOLEAN,
            ),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        method="post",
        operation_description="Mark a single notification as read",
        responses={200: NotificationSerializer},
    )
    @swagger_auto_schema(
        method="patch",
        operation_description="Mark a single notification as read",
        responses={200: NotificationSerializer},
    )
    @action(detail=True, methods=["post", "patch"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        method="post",
        operation_description="Mark all notifications as read for current user",
        responses={
            200: openapi.Response(
                "Result count",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"updated": openapi.Schema(type=openapi.TYPE_INTEGER)},
                ),
            )
        },
    )
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        updated = Notification.objects.filter(recipient=request.user, is_read=False).update(
            is_read=True
        )
        return Response({"updated": updated}, status=status.HTTP_200_OK)
