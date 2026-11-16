import logging
from datetime import timedelta

from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.notifications.models import Notification, NotificationType
from apps.tasks.models import Task, TaskStatus

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(name="apps.notifications.tasks.send_task_assignment_notification")
def send_task_assignment_notification(task_id: int, recipient_id: int):
    """Deliver assignment notification asynchronously."""
    try:
        task = Task.objects.select_related("creator").get(pk=task_id)
        recipient = User.objects.get(pk=recipient_id)
    except (Task.DoesNotExist, User.DoesNotExist) as e:
        logger.warning(
            f"Failed to send task assignment notification: {e} "
            f"(task_id={task_id}, recipient_id={recipient_id})"
        )
        return None

    title = f"Task Assigned: {task.title}"
    creator_name = task.creator.username if task.creator else "System"
    message = (
        f"You have been assigned to task '{task.title}' by {creator_name}. "
        f"Priority: {task.priority}. Status: {task.status}."
    )

    notification = Notification.objects.create(
        recipient=recipient,
        task=task,
        notification_type=NotificationType.ASSIGNMENT,
        title=title,
        message=message,
    )
    logger.info(
        f"Assignment notification {notification.id} created for {recipient.username} on task {task.id}"
    )
    return notification.id


@shared_task(name="apps.notifications.tasks.check_due_date_reminders")
def check_due_date_reminders():
    """Scan tasks due within 24 hours and send reminders, deduplicating within 24 hours."""
    now = timezone.now()
    lookahead = now + timedelta(hours=24)
    cutoff = now - timedelta(hours=24)

    tasks_due_soon = (
        Task.objects.filter(
            due_date__gte=now,
            due_date__lte=lookahead,
            assignee__isnull=False,
        )
        .exclude(status=TaskStatus.COMPLETED)
        .select_related("assignee")
    )

    reminders_created = 0
    for task in tasks_due_soon:
        already_reminded = Notification.objects.filter(
            task=task,
            recipient=task.assignee,
            notification_type=NotificationType.DUE_DATE_REMINDER,
            created_at__gte=cutoff,
        ).exists()

        if not already_reminded:
            due_str = task.due_date.strftime("%Y-%m-%d %H:%M %Z")
            Notification.objects.create(
                recipient=task.assignee,
                task=task,
                notification_type=NotificationType.DUE_DATE_REMINDER,
                title=f"Due Date Reminder: {task.title}",
                message=(
                    f"Reminder: Task '{task.title}' is due at {due_str}. "
                    f"Current status: {task.status}."
                ),
            )
            reminders_created += 1
            logger.info(f"Due date reminder created for {task.assignee.username} on task {task.id}")

    return reminders_created
