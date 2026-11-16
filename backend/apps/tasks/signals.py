from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.notifications.tasks import send_task_assignment_notification
from apps.tasks.models import Task


@receiver(pre_save, sender=Task)
def track_task_assignee_change(sender, instance, **kwargs):
    """Track if assignee changed on update."""
    if instance.pk:
        try:
            old_task = Task.objects.filter(pk=instance.pk).only("assignee_id").first()
            old_assignee_id = old_task.assignee_id if old_task else None
            instance._assignee_changed = old_assignee_id != instance.assignee_id
        except Exception:
            instance._assignee_changed = False
    else:
        instance._assignee_changed = False


@receiver(post_save, sender=Task)
def trigger_task_assignment_notification(sender, instance, created, **kwargs):
    """Dispatch async notification when task is assigned or reassigned."""
    assignee_id = instance.assignee_id
    if not assignee_id:
        return

    is_new_assignment = created or getattr(instance, "_assignee_changed", False)
    if is_new_assignment:
        task_id = instance.id
        transaction.on_commit(lambda: send_task_assignment_notification.delay(task_id, assignee_id))
