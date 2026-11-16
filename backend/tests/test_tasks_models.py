from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.tasks.models import Task, TaskPriority, TaskStatus

User = get_user_model()


@pytest.fixture
def creator(db):
    return User.objects.create_user(username="creator_user", password="secure_password123")


@pytest.fixture
def assignee(db):
    return User.objects.create_user(username="assignee_user", password="secure_password123")


@pytest.mark.django_db
class TestTaskModel:
    def test_create_task_with_defaults(self, creator):
        task = Task.objects.create(creator=creator, title="Setup Project")
        assert task.title == "Setup Project"
        assert task.description == ""
        assert task.status == TaskStatus.TODO
        assert task.priority == TaskPriority.MEDIUM
        assert task.due_date is None
        assert task.assignee is None
        assert task.created_at is not None
        assert task.updated_at is not None
        assert str(task) == "Setup Project (TODO)"

    def test_create_task_with_all_fields(self, creator, assignee):
        due = timezone.now() + timedelta(days=3)
        task = Task.objects.create(
            creator=creator,
            assignee=assignee,
            title="Design System",
            description="Create Tailwind tokens",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.HIGH,
            due_date=due,
        )
        assert task.assignee == assignee
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.priority == TaskPriority.HIGH
        assert task.due_date == due

    def test_cascade_delete_on_creator(self, creator):
        task = Task.objects.create(creator=creator, title="Orphan Candidate")
        task_id = task.id
        creator.delete()
        assert not Task.objects.filter(id=task_id).exists()

    def test_set_null_delete_on_assignee(self, creator, assignee):
        task = Task.objects.create(creator=creator, assignee=assignee, title="Shared Task")
        assignee.delete()
        task.refresh_from_db()
        assert task.assignee is None
        assert Task.objects.filter(id=task.id).exists()

    def test_invalid_status_raises_validation_error(self, creator):
        task = Task(creator=creator, title="Bad Status", status="NON_EXISTENT")
        with pytest.raises(ValidationError):
            task.full_clean()

    def test_invalid_priority_raises_validation_error(self, creator):
        task = Task(creator=creator, title="Bad Priority", priority="SUPER_HIGH")
        with pytest.raises(ValidationError):
            task.full_clean()

    def test_ordering_by_created_at_descending(self, creator):
        task1 = Task.objects.create(creator=creator, title="First")
        task2 = Task.objects.create(creator=creator, title="Second")
        tasks = list(Task.objects.all())
        assert tasks[0] == task2
        assert tasks[1] == task1
