from io import StringIO

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from apps.notifications.models import Notification
from apps.tasks.models import Task, TaskPriority, TaskStatus

User = get_user_model()


@pytest.mark.django_db
class TestSeedDataCommand:
    """Test suite for the seed_data management command."""

    def test_seed_data_populates_database(self):
        """Test initial seed populates users, tasks, and notifications."""
        out = StringIO()
        call_command("seed_data", stdout=out)

        output = out.getvalue()
        assert "Successfully seeded database" in output

        # Verify users
        assert User.objects.count() == 5
        admin_user = User.objects.get(username="admin@tasks.com")
        assert admin_user.is_superuser is True
        assert admin_user.is_staff is True
        assert admin_user.check_password("adminpassword123")

        mary = User.objects.get(username="mary.engineer")
        assert mary.email == "mary.engineer@tasks.com"
        assert mary.check_password("demopassword123")

        # Verify tasks
        assert Task.objects.count() == 16
        assert Task.objects.filter(status=TaskStatus.BACKLOG).exists()
        assert Task.objects.filter(status=TaskStatus.TODO).exists()
        assert Task.objects.filter(status=TaskStatus.IN_PROGRESS).exists()
        assert Task.objects.filter(status=TaskStatus.IN_REVIEW).exists()
        assert Task.objects.filter(status=TaskStatus.COMPLETED).exists()

        assert Task.objects.filter(priority=TaskPriority.LOW).exists()
        assert Task.objects.filter(priority=TaskPriority.MEDIUM).exists()
        assert Task.objects.filter(priority=TaskPriority.HIGH).exists()
        assert Task.objects.filter(priority=TaskPriority.URGENT).exists()

        # Verify notifications
        assert Notification.objects.count() >= 5
        assert Notification.objects.filter(recipient=mary, is_read=False).exists()

    def test_seed_data_idempotency(self):
        """Test running seed_data twice does not duplicate records."""
        call_command("seed_data", stdout=StringIO())

        initial_user_count = User.objects.count()
        initial_task_count = Task.objects.count()
        initial_notif_count = Notification.objects.count()

        # Run command second time
        out = StringIO()
        call_command("seed_data", stdout=out)

        assert User.objects.count() == initial_user_count
        assert Task.objects.count() == initial_task_count
        assert Notification.objects.count() == initial_notif_count
        assert "Successfully seeded database" in out.getvalue()
