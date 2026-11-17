from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.notifications.models import Notification, NotificationType
from apps.tasks.models import Task, TaskPriority, TaskStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with realistic demo users, tasks, and notifications."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Task Management System demo data...")

        # 1. Create or retrieve demo users
        users_data = [
            {
                "username": "admin@tasks.com",
                "email": "admin@tasks.com",
                "password": "adminpassword123",
                "is_superuser": True,
                "is_staff": True,
            },
            {
                "username": "mary.engineer",
                "email": "mary.engineer@tasks.com",
                "password": "demopassword123",
                "is_superuser": False,
                "is_staff": False,
            },
            {
                "username": "steve.marketing",
                "email": "steve.marketing@tasks.com",
                "password": "demopassword123",
                "is_superuser": False,
                "is_staff": False,
            },
            {
                "username": "sid.qa",
                "email": "sid.qa@tasks.com",
                "password": "demopassword123",
                "is_superuser": False,
                "is_staff": False,
            },
            {
                "username": "azim.security",
                "email": "azim.security@tasks.com",
                "password": "demopassword123",
                "is_superuser": False,
                "is_staff": False,
            },
        ]

        users = {}
        for u_data in users_data:
            user, created = User.objects.get_or_create(
                username=u_data["username"],
                defaults={
                    "email": u_data["email"],
                    "is_superuser": u_data["is_superuser"],
                    "is_staff": u_data["is_staff"],
                },
            )
            # Ensure password is set properly
            user.set_password(u_data["password"])
            user.email = u_data["email"]
            user.save()
            users[u_data["username"]] = user
            status_text = "Created" if created else "Updated"
            self.stdout.write(f"  - [{status_text}] User: {user.username} ({user.email})")

        admin_user = users["admin@tasks.com"]
        mary = users["mary.engineer"]
        steve = users["steve.marketing"]
        sid = users["sid.qa"]
        azim = users["azim.security"]

        now = timezone.now()

        # 2. Seed Tasks
        tasks_data = [
            # Backlog
            {
                "title": "Dark mode UI theme option",
                "description": "Provide a high-contrast dark theme toggle in the header navigation.",
                "status": TaskStatus.BACKLOG,
                "priority": TaskPriority.LOW,
                "due_date": None,
                "creator": steve,
                "assignee": None,
            },
            {
                "title": "Multi-language i18n support",
                "description": "Prepare translation catalogs for Spanish, French, and Japanese localization.",
                "status": TaskStatus.BACKLOG,
                "priority": TaskPriority.LOW,
                "due_date": now + timedelta(days=30),
                "creator": steve,
                "assignee": None,
            },
            {
                "title": "WebSocket live task synchronization",
                "description": "Add real-time board updates via Django Channels when colleagues edit tasks.",
                "status": TaskStatus.BACKLOG,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(days=45),
                "creator": mary,
                "assignee": mary,
            },
            # To Do
            {
                "title": "Implement OAuth2 social login",
                "description": "Integrate Google and GitHub single sign-on options on the login view.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(days=7),
                "creator": azim,
                "assignee": mary,
            },
            {
                "title": "Audit container security scanners",
                "description": "Integrate Trivy image scan and Grype vulnerability database into CI pipeline.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(days=3),
                "creator": azim,
                "assignee": azim,
            },
            {
                "title": "Draft marketing launch announcement",
                "description": "Prepare blog post and press release highlighting Clean Architecture principles.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(days=5),
                "creator": steve,
                "assignee": steve,
            },
            {
                "title": "Configure cross-browser Playwright test suite",
                "description": "Set up headless browser automation covering user login and task creation flows.",
                "status": TaskStatus.TODO,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(days=4),
                "creator": sid,
                "assignee": sid,
            },
            # In Progress
            {
                "title": "Perform OWASP Top 10 penetration test",
                "description": "Verify protection against injection, broken access control, and sensitive data exposure.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.URGENT,
                "due_date": now + timedelta(hours=22),
                "creator": azim,
                "assignee": azim,
            },
            {
                "title": "Optimize BigQuery and Redis caching layer",
                "description": "Benchmark query execution latency and tune Redis pool connections.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(hours=14),
                "creator": mary,
                "assignee": mary,
            },
            {
                "title": "Design responsive task filtering bar",
                "description": "Ensure search, status, and assignment toggle buttons adapt cleanly on mobile.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(days=2),
                "creator": steve,
                "assignee": mary,
            },
            # In Review
            {
                "title": "Review JWT token blacklist rotation PR",
                "description": "Audit security edge cases on refresh token consumption and replay attacks.",
                "status": TaskStatus.IN_REVIEW,
                "priority": TaskPriority.URGENT,
                "due_date": now + timedelta(hours=6),
                "creator": mary,
                "assignee": azim,
            },
            {
                "title": "Verify Celery beat due-date reminder deduplication",
                "description": "Confirm scheduled worker does not trigger duplicate email reminders within 24 hours.",
                "status": TaskStatus.IN_REVIEW,
                "priority": TaskPriority.HIGH,
                "due_date": now + timedelta(hours=8),
                "creator": mary,
                "assignee": sid,
            },
            {
                "title": "QA accessibility audit for WCAG 2.1 AA",
                "description": "Validate color contrast ratios, focus outlines, and keyboard navigation.",
                "status": TaskStatus.IN_REVIEW,
                "priority": TaskPriority.MEDIUM,
                "due_date": now + timedelta(hours=18),
                "creator": sid,
                "assignee": steve,
            },
            # Completed
            {
                "title": "Initialize Docker Compose development stack",
                "description": "Configure multi-container environment for Django, PostgreSQL, Redis, Celery, and Vite.",
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.URGENT,
                "due_date": now - timedelta(days=2),
                "creator": mary,
                "assignee": mary,
            },
            {
                "title": "Implement Clean Architecture task domain services",
                "description": "Encapsulate task lifecycle mutations into thin services decoupled from HTTP views.",
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "due_date": now - timedelta(days=1),
                "creator": mary,
                "assignee": mary,
            },
            {
                "title": "Configure Swagger OpenAPI interactive documentation",
                "description": "Annotate all endpoints with drf-yasg for interactive schema explorer.",
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "due_date": now - timedelta(hours=12),
                "creator": mary,
                "assignee": sid,
            },
        ]

        seeded_tasks = []
        for t_data in tasks_data:
            task, created = Task.objects.update_or_create(
                title=t_data["title"],
                defaults={
                    "description": t_data["description"],
                    "status": t_data["status"],
                    "priority": t_data["priority"],
                    "due_date": t_data["due_date"],
                    "creator": t_data["creator"],
                    "assignee": t_data["assignee"],
                },
            )
            seeded_tasks.append(task)
            status_text = "Created" if created else "Updated"
            self.stdout.write(
                f"  - [{status_text}] Task: {task.title} [{task.status} / {task.priority}]"
            )

        # 3. Seed Notifications
        notifications_data = [
            {
                "recipient": mary,
                "task": seeded_tasks[3],  # Implement OAuth2
                "notification_type": NotificationType.ASSIGNMENT,
                "title": "Task Assigned: Implement OAuth2 social login",
                "message": "You have been assigned to task 'Implement OAuth2 social login' by azim.security.",
                "is_read": False,
            },
            {
                "recipient": mary,
                "task": seeded_tasks[8],  # Optimize BigQuery
                "notification_type": NotificationType.DUE_DATE_REMINDER,
                "title": "Due Date Reminder: Optimize BigQuery and Redis caching layer",
                "message": "Reminder: Task 'Optimize BigQuery and Redis caching layer' is due in 14 hours.",
                "is_read": False,
            },
            {
                "recipient": azim,
                "task": seeded_tasks[10],  # Review JWT token
                "notification_type": NotificationType.ASSIGNMENT,
                "title": "Task Assigned: Review JWT token blacklist rotation PR",
                "message": "You have been assigned to task 'Review JWT token blacklist rotation PR' by mary.engineer.",
                "is_read": False,
            },
            {
                "recipient": sid,
                "task": seeded_tasks[11],  # Verify Celery beat
                "notification_type": NotificationType.ASSIGNMENT,
                "title": "Task Assigned: Verify Celery beat due-date reminder deduplication",
                "message": "You have been assigned to task 'Verify Celery beat due-date reminder deduplication' by mary.engineer.",
                "is_read": True,
            },
            {
                "recipient": admin_user,
                "task": seeded_tasks[13],  # Initialize Docker Compose
                "notification_type": NotificationType.ASSIGNMENT,
                "title": "Task Assigned: Initialize Docker Compose development stack",
                "message": "Welcome to TaskFlow! Demo environment initialized.",
                "is_read": True,
            },
        ]

        for n_data in notifications_data:
            existing = Notification.objects.filter(
                recipient=n_data["recipient"],
                task=n_data["task"],
                notification_type=n_data["notification_type"],
            ).first()
            if existing:
                notif = existing
                created = False
            else:
                notif = Notification.objects.create(
                    recipient=n_data["recipient"],
                    task=n_data["task"],
                    notification_type=n_data["notification_type"],
                    title=n_data["title"],
                    message=n_data["message"],
                    is_read=n_data["is_read"],
                )
                created = True
            status_text = "Created" if created else "Existing"
            self.stdout.write(
                f"  - [{status_text}] Notification for {notif.recipient.username}: {notif.title}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded database with {len(users)} users, {len(seeded_tasks)} tasks, and sample notifications."
            )
        )
