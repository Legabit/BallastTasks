import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_health_check_endpoint(client):
    url = reverse("health-check")
    response = client.get(url)
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "cache" in data
    assert data["database"] == "connected"


@pytest.mark.django_db
def test_root_health_check_endpoint(client):
    url = reverse("root-health-check")
    response = client.get(url)
    assert response.status_code in [200, 503]
