import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status

User = get_user_model()


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def existing_user(db):
    return User.objects.create_user(
        username="existinguser",
        email="existing@example.com",
        password="ValidPassword123!",
    )


@pytest.mark.django_db
class TestUserRegistration:
    def test_registration_success(self, client):
        url = reverse("auth-register")
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPassword987!",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "password" not in data
        assert User.objects.filter(username="newuser").exists()

    def test_registration_duplicate_username(self, client, existing_user):
        url = reverse("auth-register")
        payload = {
            "username": "existinguser",
            "email": "other@example.com",
            "password": "StrongPassword987!",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "username" in response.json()

    def test_registration_duplicate_email(self, client, existing_user):
        url = reverse("auth-register")
        payload = {
            "username": "uniqueuser",
            "email": "EXISTING@EXAMPLE.COM",  # case-insensitive check
            "password": "StrongPassword987!",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.json()

    def test_registration_short_password(self, client):
        url = reverse("auth-register")
        payload = {
            "username": "validuser",
            "email": "valid@example.com",
            "password": "short",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.json()

    def test_registration_numeric_password(self, client):
        url = reverse("auth-register")
        payload = {
            "username": "validuser",
            "email": "valid@example.com",
            "password": "1234567890",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "password" in response.json()


@pytest.mark.django_db
class TestJWTAuthentication:
    def test_login_success(self, client, existing_user):
        url = reverse("auth-login")
        payload = {
            "username": "existinguser",
            "password": "ValidPassword123!",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_login_invalid_credentials(self, client, existing_user):
        url = reverse("auth-login")
        payload = {
            "username": "existinguser",
            "password": "WrongPassword123!",
        }
        response = client.post(url, payload, content_type="application/json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh_and_rotation(self, client, existing_user):
        login_url = reverse("auth-login")
        login_res = client.post(
            login_url,
            {"username": "existinguser", "password": "ValidPassword123!"},
            content_type="application/json",
        )
        refresh_token = login_res.json()["refresh"]

        refresh_url = reverse("auth-token-refresh")
        refresh_res = client.post(
            refresh_url,
            {"refresh": refresh_token},
            content_type="application/json",
        )
        assert refresh_res.status_code == status.HTTP_200_OK
        data = refresh_res.json()
        assert "access" in data
        assert "refresh" in data
        new_refresh_token = data["refresh"]
        assert new_refresh_token != refresh_token

        # Consumed refresh token should be blacklisted and rejected on reuse
        replay_res = client.post(
            refresh_url,
            {"refresh": refresh_token},
            content_type="application/json",
        )
        assert replay_res.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserProfile:
    def test_me_endpoint_authenticated(self, client, existing_user):
        login_url = reverse("auth-login")
        login_res = client.post(
            login_url,
            {"username": "existinguser", "password": "ValidPassword123!"},
            content_type="application/json",
        )
        access_token = login_res.json()["access"]

        me_url = reverse("auth-me")
        res = client.get(me_url, HTTP_AUTHORIZATION=f"Bearer {access_token}")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["id"] == existing_user.id
        assert data["username"] == existing_user.username
        assert data["email"] == existing_user.email

    def test_me_endpoint_unauthenticated(self, client):
        me_url = reverse("auth-me")
        res = client.get(me_url)
        assert res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_endpoint_invalid_token(self, client):
        me_url = reverse("auth-me")
        res = client.get(me_url, HTTP_AUTHORIZATION="Bearer invalid.token.value")
        assert res.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAuthenticationThrottling:
    def test_auth_rate_limiting_enforcement(self, client):
        url = reverse("auth-login")
        payload = {"username": "unknown", "password": "wrongpassword"}

        # 10 requests allowed under auth throttle (10/minute)
        for _ in range(10):
            response = client.post(url, payload, content_type="application/json")
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # 11th request must be throttled
        throttled_res = client.post(url, payload, content_type="application/json")
        assert throttled_res.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "detail" in throttled_res.json()
