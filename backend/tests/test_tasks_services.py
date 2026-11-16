from datetime import timedelta
import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.tasks.models import TaskPriority, TaskStatus
from apps.tasks.services import (
    TaskValidationError,
    assign_task,
    create_task,
    mark_task_completed,
    update_task,
)

User = get_user_model()


@pytest.fixture
def creator(db):
    return User.objects.create_user(username="lead_dev", password="password123")


@pytest.fixture
def assignee(db):
    return User.objects.create_user(username="qa_engineer", password="password123")


@pytest.mark.django_db
class TestTaskServices:
    def test_create_task_service_success(self, creator, assignee):
        due = timezone.now() + timedelta(days=2)
        task = create_task(
            creator=creator,
            title="Implement Core Domain",
            description="Build domain models and services",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.URGENT,
            due_date=due,
            assignee=assignee,
        )
        assert task.id is not None
        assert task.creator == creator
        assert task.assignee == assignee
        assert task.title == "Implement Core Domain"
        assert task.status == TaskStatus.IN_PROGRESS
        assert task.priority == TaskPriority.URGENT
        assert task.due_date == due

    def test_create_task_missing_creator_raises_error(self):
        with pytest.raises(TaskValidationError, match="valid creator"):
            create_task(creator=None, title="No Creator")

    def test_create_task_empty_title_raises_error(self, creator):
        with pytest.raises(TaskValidationError, match="title cannot be empty"):
            create_task(creator=creator, title="   ")

    def test_create_task_invalid_status_raises_error(self, creator):
        with pytest.raises(TaskValidationError, match="Invalid task status"):
            create_task(creator=creator, title="Task", status="INVALID")

    def test_create_task_invalid_priority_raises_error(self, creator):
        with pytest.raises(TaskValidationError, match="Invalid task priority"):
            create_task(creator=creator, title="Task", priority="INVALID")

    def test_update_task_service_success(self, creator, assignee):
        task = create_task(creator=creator, title="Initial Title")
        new_due = timezone.now() + timedelta(days=5)

        updated = update_task(
            task=task,
            title="Updated Title",
            description="New description",
            status=TaskStatus.IN_REVIEW,
            priority=TaskPriority.HIGH,
            due_date=new_due,
            assignee=assignee,
        )
        assert updated.title == "Updated Title"
        assert updated.description == "New description"
        assert updated.status == TaskStatus.IN_REVIEW
        assert updated.priority == TaskPriority.HIGH
        assert updated.due_date == new_due
        assert updated.assignee == assignee

    def test_update_task_clear_due_date(self, creator):
        due = timezone.now() + timedelta(days=1)
        task = create_task(creator=creator, title="Due Task", due_date=due)
        assert task.due_date is not None

        updated = update_task(task=task, clear_due_date=True)
        assert updated.due_date is None

    def test_update_task_empty_title_raises_error(self, creator):
        task = create_task(creator=creator, title="Valid Title")
        with pytest.raises(TaskValidationError, match="title cannot be empty"):
            update_task(task=task, title="   ")

    def test_update_task_invalid_status_raises_error(self, creator):
        task = create_task(creator=creator, title="Valid Title")
        with pytest.raises(TaskValidationError, match="Invalid task status"):
            update_task(task=task, status="UNKNOWN")

    def test_assign_task_service(self, creator, assignee):
        task = create_task(creator=creator, title="Unassigned Task")
        assert task.assignee is None

        assign_task(task=task, assignee=assignee)
        task.refresh_from_db()
        assert task.assignee == assignee

        assign_task(task=task, assignee=None)
        task.refresh_from_db()
        assert task.assignee is None

    def test_mark_task_completed_service(self, creator):
        task = create_task(creator=creator, title="Pending Task", status=TaskStatus.TODO)
        assert task.status == TaskStatus.TODO

        mark_task_completed(task=task)
        task.refresh_from_db()
        assert task.status == TaskStatus.COMPLETED
