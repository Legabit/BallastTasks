from datetime import datetime
from typing import Any
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from .models import Task, TaskPriority, TaskStatus

User = get_user_model()


class TaskDomainError(Exception):
    """Base domain exception for task operations."""


class TaskValidationError(TaskDomainError):
    """Raised when task parameters fail business validation."""


class InvalidStatusTransitionError(TaskDomainError):
    """Raised when an illegal status transition is requested."""


def create_task(
    *,
    creator: Any,
    title: str,
    description: str = "",
    status: str = TaskStatus.TODO,
    priority: str = TaskPriority.MEDIUM,
    due_date: datetime | None = None,
    assignee: Any = None,
) -> Task:
    """Domain service to create and validate a new task."""
    if not creator or not getattr(creator, "pk", None):
        raise TaskValidationError("Task must have a valid creator.")

    cleaned_title = title.strip() if title else ""
    if not cleaned_title:
        raise TaskValidationError("Task title cannot be empty.")

    if status not in TaskStatus.values:
        raise TaskValidationError(f"Invalid task status: '{status}'.")

    if priority not in TaskPriority.values:
        raise TaskValidationError(f"Invalid task priority: '{priority}'.")

    task = Task(
        creator=creator,
        title=cleaned_title,
        description=description,
        status=status,
        priority=priority,
        due_date=due_date,
        assignee=assignee,
    )
    task.full_clean()
    task.save()
    return task


def update_task(
    *,
    task: Task,
    title: str | None = None,
    description: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    due_date: datetime | None = None,
    clear_due_date: bool = False,
    assignee: Any = ...,
) -> Task:
    """Domain service to update an existing task with business validation."""
    if title is not None:
        cleaned_title = title.strip()
        if not cleaned_title:
            raise TaskValidationError("Task title cannot be empty.")
        task.title = cleaned_title

    if description is not None:
        task.description = description

    if status is not None:
        if status not in TaskStatus.values:
            raise TaskValidationError(f"Invalid task status: '{status}'.")
        task.status = status

    if priority is not None:
        if priority not in TaskPriority.values:
            raise TaskValidationError(f"Invalid task priority: '{priority}'.")
        task.priority = priority

    if clear_due_date:
        task.due_date = None
    elif due_date is not None:
        task.due_date = due_date

    if assignee is not ...:
        task.assignee = assignee

    task.full_clean()
    task.save()
    return task


def assign_task(
    *,
    task: Task,
    assignee: Any,
) -> Task:
    """Domain service to assign a task to a user or unassign (None)."""
    task.assignee = assignee
    task.save(update_fields=["assignee", "updated_at"])
    return task


def mark_task_completed(*, task: Task) -> Task:
    """Domain service to transition a task status to COMPLETED."""
    task.status = TaskStatus.COMPLETED
    task.save(update_fields=["status", "updated_at"])
    return task
