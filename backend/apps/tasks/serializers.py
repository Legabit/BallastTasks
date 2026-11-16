from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Task, TaskPriority, TaskStatus
from .services import TaskValidationError, create_task, update_task

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")
        read_only_fields = fields


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSummarySerializer(read_only=True)
    assignee = UserSummarySerializer(read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "creator",
            "assignee",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "creator", "created_at", "updated_at")


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "assignee",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def to_representation(self, instance):
        return TaskSerializer(instance, context=self.context).data

    def create(self, validated_data):
        creator = self.context["request"].user
        try:
            return create_task(
                creator=creator,
                title=validated_data.get("title", ""),
                description=validated_data.get("description", ""),
                status=validated_data.get("status", TaskStatus.TODO),
                priority=validated_data.get("priority", TaskPriority.MEDIUM),
                due_date=validated_data.get("due_date"),
                assignee=validated_data.get("assignee"),
            )
        except TaskValidationError as e:
            raise serializers.ValidationError({"detail": str(e)})

    def update(self, instance, validated_data):
        try:
            return update_task(
                task=instance,
                title=validated_data.get("title"),
                description=validated_data.get("description"),
                status=validated_data.get("status"),
                priority=validated_data.get("priority"),
                due_date=validated_data.get("due_date"),
                assignee=validated_data.get("assignee", ...),
            )
        except TaskValidationError as e:
            raise serializers.ValidationError({"detail": str(e)})
