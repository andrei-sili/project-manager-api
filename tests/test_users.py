import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
def test_user_register(api_client):
    url = reverse("user-register")
    data = {
        "email": "newuser@example.com",
        "password": "test12345",
        "first_name": "John",
        "last_name": "Doe"
    }
    response = api_client.post(url, data)
    assert response.status_code == 201
    assert "token" in response.data


@pytest.mark.django_db
def test_user_login(api_client):
    from apps.users.models import CustomUser
    user = CustomUser.objects.create_user(
        email="testuser@example.com",
        password="password123",
        is_active=True
    )

    url = reverse("token_obtain_pair")
    data = {"email": user.email, "password": "password123"}

    response = api_client.post(url, data)
    print(response.data)
    assert response.status_code == 200
    assert "access" in response.data




@pytest.mark.django_db
def test_user_profile(auth_client, user):
    url = reverse("user-me")
    response = auth_client.get(url)
    assert response.status_code == 200
    assert response.data["email"] == user.email


@pytest.mark.django_db
def test_update_profile(auth_client):
    url = reverse("user-update-profile")
    data = {"first_name": "Updated"}
    response = auth_client.patch(url, data)
    assert response.status_code == 200
    assert response.data["first_name"] == "Updated"


@pytest.mark.django_db
def test_change_password(auth_client, user):
    url = reverse("user-change-password")
    data = {
        "old_password": "password123",
        "new_password": "newsecure123"
    }
    response = auth_client.post(url, data)
    assert response.status_code == 200


@pytest.mark.django_db
def test_reset_password_request(api_client, user):
    url = reverse("request-reset-password")
    data = {"email": user.email}
    response = api_client.post(url, data)
    assert response.status_code == 200


@pytest.mark.django_db
def test_reset_password_confirm(api_client, user, db):
    from apps.users.models import PasswordResetToken
    token = PasswordResetToken.objects.create(user=user)
    url = reverse("confirm-reset-password")
    data = {
        "token": str(token.token),
        "new_password": "newpassword123"
    }
    response = api_client.post(url, data)
    assert response.status_code == 200


@pytest.mark.django_db
def test_register_existing_user(api_client, user):
    url = reverse("user-register")
    data = {
        "email": user.email,
        "password": "password123",
        "first_name": "Ion",
        "last_name": "Popescu"
    }
    response = api_client.post(url, data)
    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_update_profile_unauthenticated(api_client):
    api_client.credentials()
    url = reverse("user-update-profile")
    data = {"first_name": "Test"}
    response = api_client.patch(url, data)
    print(response.data)  # DEBUG
    assert response.status_code == 401




@pytest.mark.django_db
def test_change_password_wrong_old(auth_client):
    url = reverse("user-change-password")
    data = {
        "old_password": "wrongpassword",
        "new_password": "newsecure123"
    }
    response = auth_client.post(url, data)
    assert response.status_code == 400
    assert "old_password" in response.data


@pytest.mark.django_db
def test_reset_password_invalid_token(api_client):
    url = reverse("confirm-reset-password")
    data = {
        "token": "12345678-aaaa-bbbb-cccc-123456789000",
        "new_password": "somepassword123"
    }
    response = api_client.post(url, data)
    assert response.status_code == 400
    assert "detail" in response.data
