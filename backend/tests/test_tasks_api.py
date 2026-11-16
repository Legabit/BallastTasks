from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.tasks.models import Task, TaskPriority, TaskStatus

User = get_user_model()


@pytest.fixture
def creator(db):
    return User.objects.create_user(username="creator_bob", password="Password123!")


@pytest.fixture
def assignee(db):
    return User.objects.create_user(username="assignee_alice", password="Password123!")


@pytest.fixture
def third_party(db):
    return User.objects.create_user(username="third_party_charlie", password="Password123!")


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(username="admin_dan", password="Password123!")


@pytest.fixture
def creator_client(creator):
    client = APIClient()
    client.force_authenticate(user=creator)
    return client


@pytest.fixture
def assignee_client(assignee):
    client = APIClient()
    client.force_authenticate(user=assignee)
    return client


@pytest.fixture
def third_party_client(third_party):
    client = APIClient()
    client.force_authenticate(user=third_party)
    return client


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.mark.django_db
class TestTaskCRUDAPI:
    def test_unauthenticated_request_rejected(self):
        client = APIClient()
        url = reverse("task-list")
        res = client.get(url)
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_task_success(self, creator_client, creator, assignee):
        url = reverse("task-list")
        due = timezone.now() + timedelta(days=2)
        payload = {
            "title": "API Build",
            "description": "Build DRF endpoints",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "due_date": due.isoformat(),
            "assignee": assignee.id,
        }
        res = creator_client.post(url, payload, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        data = res.json()
        assert data["title"] == "API Build"
        assert data["creator"]["id"] == creator.id
        assert data["assignee"]["id"] == assignee.id
        assert data["status"] == TaskStatus.IN_PROGRESS
        assert data["priority"] == TaskPriority.HIGH

    def test_create_task_empty_title_fails(self, creator_client):
        url = reverse("task-list")
        res = creator_client.post(url, {"title": "   "}, format="json")
        assert res.status_code == status.HTTP_400_BAD_REQUEST

    def test_retrieve_task_creator_and_assignee_allowed(
        self, creator, assignee, creator_client, assignee_client
    ):
        task = Task.objects.create(creator=creator, assignee=assignee, title="Shared Task")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res_creator = creator_client.get(url)
        assert res_creator.status_code == status.HTTP_200_OK
        assert res_creator.json()["id"] == task.id

        res_assignee = assignee_client.get(url)
        assert res_assignee.status_code == status.HTTP_200_OK
        assert res_assignee.json()["id"] == task.id

    def test_retrieve_task_unrelated_user_forbidden_or_not_found(self, creator, third_party_client):
        task = Task.objects.create(creator=creator, title="Secret Task")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = third_party_client.get(url)
        assert res.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND)

    def test_update_task_creator_allowed(self, creator, creator_client):
        task = Task.objects.create(creator=creator, title="Old Title")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = creator_client.patch(
            url, {"title": "New Title", "status": TaskStatus.COMPLETED}, format="json"
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["title"] == "New Title"
        assert res.json()["status"] == TaskStatus.COMPLETED

    def test_update_task_assignee_can_update_status(self, creator, assignee, assignee_client):
        task = Task.objects.create(
            creator=creator, assignee=assignee, title="Work on Bug", status=TaskStatus.TODO
        )
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = assignee_client.patch(url, {"status": TaskStatus.IN_PROGRESS}, format="json")
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["status"] == TaskStatus.IN_PROGRESS

    def test_assignee_cannot_reassign_task(self, creator, assignee, third_party, assignee_client):
        task = Task.objects.create(creator=creator, assignee=assignee, title="Work on Feature")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = assignee_client.patch(url, {"assignee": third_party.id}, format="json")
        assert res.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_task_creator_allowed(self, creator, creator_client):
        task = Task.objects.create(creator=creator, title="To Delete")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = creator_client.delete(url)
        assert res.status_code == status.HTTP_204_NO_CONTENT
        assert not Task.objects.filter(id=task.id).exists()

    def test_delete_task_assignee_forbidden(self, creator, assignee, assignee_client):
        task = Task.objects.create(creator=creator, assignee=assignee, title="Cannot Delete")
        url = reverse("task-detail", kwargs={"pk": task.id})

        res = assignee_client.delete(url)
        assert res.status_code == status.HTTP_403_FORBIDDEN
        assert Task.objects.filter(id=task.id).exists()


@pytest.mark.django_db
class TestTaskFilteringAndPagination:
    @pytest.fixture(autouse=True)
    def setup_tasks(self, creator, assignee, third_party):
        now = timezone.now()
        # Tasks created by creator
        Task.objects.create(
            creator=creator,
            title="Fix Auth Bug",
            status=TaskStatus.TODO,
            priority=TaskPriority.HIGH,
            due_date=now + timedelta(days=1),
        )
        Task.objects.create(
            creator=creator,
            assignee=assignee,
            title="Build Dashboard UI",
            status=TaskStatus.IN_PROGRESS,
            priority=TaskPriority.MEDIUM,
            due_date=now + timedelta(days=5),
        )
        Task.objects.create(
            creator=creator,
            title="Write Tests",
            status=TaskStatus.COMPLETED,
            priority=TaskPriority.LOW,
            due_date=now - timedelta(days=1),
        )
        # Task created by third party (unrelated)
        Task.objects.create(
            creator=third_party,
            title="Third Party Private",
            status=TaskStatus.TODO,
            priority=TaskPriority.URGENT,
        )

    def test_list_tasks_scoped_to_participant(self, creator_client):
        url = reverse("task-list")
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 3
        titles = [t["title"] for t in data["results"]]
        assert "Third Party Private" not in titles

    def test_admin_sees_all_tasks(self, admin_client):
        url = reverse("task-list")
        res = admin_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["count"] == 4

    def test_filter_by_status(self, creator_client):
        url = f"{reverse('task-list')}?status={TaskStatus.TODO}"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 1
        assert data["results"][0]["status"] == TaskStatus.TODO

    def test_filter_by_priority(self, creator_client):
        url = f"{reverse('task-list')}?priority={TaskPriority.HIGH}"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 1
        assert data["results"][0]["priority"] == TaskPriority.HIGH

    def test_filter_by_due_date_range(self, creator_client):
        now = timezone.now()
        future_date = (now + timedelta(days=2)).isoformat()
        url = f"{reverse('task-list')}?due_date_after={future_date}"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 1
        assert data["results"][0]["title"] == "Build Dashboard UI"

    def test_filter_assigned_to_me(self, assignee_client):
        url = f"{reverse('task-list')}?assigned_to_me=true"
        res = assignee_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 1
        assert data["results"][0]["title"] == "Build Dashboard UI"

    def test_filter_created_by_me(self, creator_client):
        url = f"{reverse('task-list')}?created_by_me=true"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 3

    def test_search_by_title_and_description(self, creator_client):
        url = f"{reverse('task-list')}?search=Auth"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["count"] == 1
        assert data["results"][0]["title"] == "Fix Auth Bug"

    def test_ordering_by_due_date(self, creator_client):
        url = f"{reverse('task-list')}?ordering=due_date"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        results = res.json()["results"]
        # nulls typically last in ascending or ordered
        assert results[0]["title"] == "Write Tests"

    def test_pagination_custom_page_size(self, creator_client):
        url = f"{reverse('task-list')}?page_size=2"
        res = creator_client.get(url)
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert len(data["results"]) == 2
        assert data["next"] is not None

    def test_query_count_avoids_n_plus_one(self, creator_client, django_assert_num_queries):
        url = reverse("task-list")
        # With select_related("creator", "assignee"), count is bounded:
        # 1 count query + 1 data query with joins
        with django_assert_num_queries(2):
            res = creator_client.get(url)
            assert res.status_code == status.HTTP_200_OK
