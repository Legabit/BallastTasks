from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source="task.title", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "task",
            "task_title",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "recipient",
            "task",
            "task_title",
            "notification_type",
            "title",
            "message",
            "created_at",
        ]
