from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.notifications.models import Notification, NotificationType
from apps.notifications.tasks import (
    check_due_date_reminders,
    send_task_assignment_notification,
)
from apps.tasks.models import Task, TaskPriority, TaskStatus
from apps.tasks.services import assign_task, create_task, update_task

User = get_user_model()


@pytest.fixture
def user_a(db):
    return User.objects.create_user(username="usera", email="usera@example.com", password="password123")


@pytest.fixture
def user_b(db):
    return User.objects.create_user(username="userb", email="userb@example.com", password="password123")


@pytest.fixture
def client_a(user_a):
    client = APIClient()
    client.force_authenticate(user=user_a)
    return client


@pytest.fixture
def client_b(user_b):
    client = APIClient()
    client.force_authenticate(user=user_b)
    return client


@pytest.mark.django_db
class TestNotificationModel:
    def test_create_notification(self, user_a):
        task = Task.objects.create(creator=user_a, title="Test Task")
        notif = Notification.objects.create(
            recipient=user_a,
            task=task,
            notification_type=NotificationType.ASSIGNMENT,
            title="Task Assigned",
            message="You have been assigned to Test Task.",
        )
        assert notif.id is not None
        assert not notif.is_read
        assert notif.notification_type == NotificationType.ASSIGNMENT
        assert str(notif) == f"[{NotificationType.ASSIGNMENT}] usera: Task Assigned"

    def test_notification_cascade_on_task_delete(self, user_a):
        task = Task.objects.create(creator=user_a, title="Ephemeral Task")
        notif = Notification.objects.create(
            recipient=user_a,
            task=task,
            notification_type=NotificationType.ASSIGNMENT,
            title="Assignment",
            message="Notice",
        )
        task.delete()
        assert not Notification.objects.filter(pk=notif.pk).exists()

    def test_notification_cascade_on_recipient_delete(self, user_a):
        task = Task.objects.create(creator=user_a, title="Task")
        notif = Notification.objects.create(
            recipient=user_a,
            task=task,
            notification_type=NotificationType.ASSIGNMENT,
            title="Assignment",
            message="Notice",
        )
        user_a.delete()
        assert not Notification.objects.filter(pk=notif.pk).exists()


@pytest.mark.django_db
class TestCeleryNotificationTasks:
    def test_send_task_assignment_notification_success(self, user_a, user_b):
        task = Task.objects.create(creator=user_a, assignee=user_b, title="Deploy Release")
        notif_id = send_task_assignment_notification(task.id, user_b.id)

        assert notif_id is not None
        notif = Notification.objects.get(pk=notif_id)
        assert notif.recipient == user_b
        assert notif.task == task
        assert notif.notification_type == NotificationType.ASSIGNMENT
        assert "Deploy Release" in notif.title
        assert "usera" in notif.message

    def test_send_task_assignment_notification_nonexistent_task(self, user_a):
        result = send_task_assignment_notification(99999, user_a.id)
        assert result is None

    def test_send_task_assignment_notification_nonexistent_user(self, user_a):
        task = Task.objects.create(creator=user_a, title="Solo Task")
        result = send_task_assignment_notification(task.id, 99999)
        assert result is None

    def test_check_due_date_reminders_creates_notification(self, user_a, user_b):
        now = timezone.now()
        due_soon = now + timedelta(hours=5)

        task = Task.objects.create(
            creator=user_a,
            assignee=user_b,
            title="Upcoming Deadline Task",
            due_date=due_soon,
            status=TaskStatus.IN_PROGRESS,
        )

        sent_count = check_due_date_reminders()
        assert sent_count == 1

        notif = Notification.objects.filter(task=task, recipient=user_b).first()
        assert notif is not None
        assert notif.notification_type == NotificationType.DUE_DATE_REMINDER
        assert "Upcoming Deadline Task" in notif.title

    def test_check_due_date_reminders_skips_completed_task(self, user_a, user_b):
        now = timezone.now()
        Task.objects.create(
            creator=user_a,
            assignee=user_b,
            title="Done Task",
            due_date=now + timedelta(hours=2),
            status=TaskStatus.COMPLETED,
        )

        sent_count = check_due_date_reminders()
        assert sent_count == 0

    def test_check_due_date_reminders_skips_unassigned_task(self, user_a):
        now = timezone.now()
        Task.objects.create(
            creator=user_a,
            assignee=None,
            title="Unassigned Task",
            due_date=now + timedelta(hours=2),
            status=TaskStatus.TODO,
        )

        sent_count = check_due_date_reminders()
        assert sent_count == 0

    def test_check_due_date_reminders_skips_task_outside_24h(self, user_a, user_b):
        now = timezone.now()
        Task.objects.create(
            creator=user_a,
            assignee=user_b,
            title="Far Away Task",
            due_date=now + timedelta(days=5),
            status=TaskStatus.TODO,
        )

        sent_count = check_due_date_reminders()
        assert sent_count == 0

    def test_check_due_date_reminders_deduplication(self, user_a, user_b):
        now = timezone.now()
        Task.objects.create(
            creator=user_a,
            assignee=user_b,
            title="Deduplication Task",
            due_date=now + timedelta(hours=4),
            status=TaskStatus.TODO,
        )

        # First run creates 1 reminder
        first_run = check_due_date_reminders()
        assert first_run == 1

        # Second run immediately after should create 0 reminders due to deduplication
        second_run = check_due_date_reminders()
        assert second_run == 0


@pytest.mark.django_db(transaction=True)
class TestTaskAssignmentSignals:
    def test_task_creation_with_assignee_triggers_notification(self, user_a, user_b):
        create_task(
            creator=user_a,
            title="Signal Task",
            assignee=user_b,
        )

        notif = Notification.objects.filter(recipient=user_b, notification_type=NotificationType.ASSIGNMENT).first()
        assert notif is not None
        assert "Signal Task" in notif.title

    def test_task_creation_without_assignee_no_notification(self, user_a):
        create_task(
            creator=user_a,
            title="Unassigned Signal Task",
        )
        assert Notification.objects.count() == 0

    def test_task_update_reassignee_triggers_notification(self, user_a, user_b):
        task = create_task(creator=user_a, title="Initial Task")
        assert Notification.objects.count() == 0

        assign_task(task=task, assignee=user_b)
        notif = Notification.objects.filter(recipient=user_b).first()
        assert notif is not None
        assert notif.task == task

    def test_task_update_same_assignee_does_not_duplicate_notification(self, user_a, user_b):
        task = create_task(creator=user_a, title="Stable Task", assignee=user_b)
        initial_count = Notification.objects.filter(recipient=user_b).count()
        assert initial_count == 1

        update_task(task=task, title="Renamed Stable Task", priority=TaskPriority.HIGH)
        final_count = Notification.objects.filter(recipient=user_b).count()
        assert final_count == 1


@pytest.mark.django_db
class TestNotificationAPI:
    def test_unauthenticated_request_rejected(self):
        client = APIClient()
        url = reverse("notification-list")
        res = client.get(url)
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_notifications_scoped_to_current_user(self, user_a, user_b, client_a, client_b):
        Notification.objects.create(
            recipient=user_a,
            title="Notice for A",
            message="A message",
            notification_type=NotificationType.ASSIGNMENT,
        )
        Notification.objects.create(
            recipient=user_b,
            title="Notice for B",
            message="B message",
            notification_type=NotificationType.ASSIGNMENT,
        )

        url = reverse("notification-list")
        res_a = client_a.get(url)
        assert res_a.status_code == status.HTTP_200_OK
        data_a = res_a.json()["results"]
        assert len(data_a) == 1
        assert data_a[0]["title"] == "Notice for A"

        res_b = client_b.get(url)
        assert res_b.status_code == status.HTTP_200_OK
        data_b = res_b.json()["results"]
        assert len(data_b) == 1
        assert data_b[0]["title"] == "Notice for B"

    def test_filter_unread_notifications(self, user_a, client_a):
        n1 = Notification.objects.create(
            recipient=user_a,
            title="Unread Notice",
            message="Msg",
            is_read=False,
        )
        Notification.objects.create(
            recipient=user_a,
            title="Read Notice",
            message="Msg",
            is_read=True,
        )

        url = reverse("notification-list") + "?unread=true"
        res = client_a.get(url)
        assert res.status_code == status.HTTP_200_OK
        results = res.json()["results"]
        assert len(results) == 1
        assert results[0]["id"] == n1.id

    def test_mark_single_notification_read(self, user_a, client_a):
        notif = Notification.objects.create(
            recipient=user_a,
            title="Pending Read",
            message="Msg",
            is_read=False,
        )

        url = reverse("notification-mark-read", kwargs={"pk": notif.id})
        res = client_a.post(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["is_read"] is True

        notif.refresh_from_db()
        assert notif.is_read is True

    def test_mark_all_notifications_read(self, user_a, client_a):
        Notification.objects.create(recipient=user_a, title="N1", message="M1", is_read=False)
        Notification.objects.create(recipient=user_a, title="N2", message="M2", is_read=False)

        url = reverse("notification-mark-all-read")
        res = client_a.post(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["updated"] == 2

        assert Notification.objects.filter(recipient=user_a, is_read=False).count() == 0

    def test_user_cannot_access_or_modify_other_user_notification(self, user_a, user_b, client_b):
        notif = Notification.objects.create(
            recipient=user_a,
            title="Private to A",
            message="Secret",
            is_read=False,
        )

        # User B attempts to mark A's notification as read
        url = reverse("notification-mark-read", kwargs={"pk": notif.id})
        res = client_b.post(url)
        assert res.status_code == status.HTTP_404_NOT_FOUND

        notif.refresh_from_db()
        assert not notif.is_read
