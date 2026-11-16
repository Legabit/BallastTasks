from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class NotificationType(models.TextChoices):
    ASSIGNMENT = "ASSIGNMENT", "Assignment"
    DUE_DATE_REMINDER = "DUE_DATE_REMINDER", "Due Date Reminder"


class Notification(models.Model):
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    task = models.ForeignKey(
        "tasks.Task",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=32,
        choices=NotificationType.choices,
        default=NotificationType.ASSIGNMENT,
        db_index=True,
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read"], name="notif_recipient_read_idx"),
            models.Index(fields=["task", "notification_type"], name="notif_task_type_idx"),
        ]

    def __str__(self) -> str:
        return f"[{self.notification_type}] {self.recipient.username}: {self.title}"
