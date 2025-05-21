import pytest
from django.urls import reverse
from rest_framework import status

from tests.factories import UserFactory


@pytest.mark.django_db
def test_user_register(api_client):
    url = reverse("user-register")
    data = {
        "email": "newuser@example.com",
        "password": "test12345A!",
        "first_name": "John",
        "last_name": "Doe"
    }
    response = api_client.post(url, data)
    assert response.status_code == 201
    assert "token" in response.data


@pytest.mark.django_db
def test_register_missing_email(api_client):
    data = {"password": "test12345A!"}
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "email" in res.data


@pytest.mark.django_db
def test_register_invalid_email(api_client):
    data = {
        "email": "invalid-email",
        "password": "SecurePass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    url = reverse("user-register")
    response = api_client.post(url, data)

    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_register_missing_first_last_name(api_client):
    data = {
        "email": "test@example.com",
        "password": "SecurePass123!",

    }
    url = reverse("user-register")
    response = api_client.post(url, data)

    assert response.status_code == 400
    assert "first_name" in response.data
    assert "last_name" in response.data


@pytest.mark.django_db
def test_register_short_password(api_client):
    data = {"email": "x@y.com", "password": "123", "first_name": "Ana", "last_name": "Pop"}
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "password" in res.data


@pytest.mark.django_db
def test_register_long_password(api_client):
    data = {"email": "x@y.com", "password": "123AB..gdhdt566sgsghjdkkGFdRTtGgj", "first_name": "Ana",
            "last_name": "Pop"}
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "password" in res.data


@pytest.mark.django_db
def test_register_password_without_digit(api_client):
    data = {
        "email": "nodigit@example.com",
        "password": "Password",
        "first_name": "Ana",
        "last_name": "Pop"
    }
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "password" in res.data


@pytest.mark.django_db
def test_register_password_without_uppercase(api_client):
    data = {
        "email": "nolower@example.com",
        "password": "password1",
        "first_name": "Ana",
        "last_name": "Pop"
    }
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "password" in res.data


@pytest.mark.django_db
def test_register_password_without_special_char(api_client):
    data = {
        "email": "nospecial@example.com",
        "password": "Password1",
        "first_name": "Ana",
        "last_name": "Pop"
    }
    url = reverse("user-register")
    res = api_client.post(url, data)
    assert res.status_code == 400
    assert "password" in res.data


@pytest.mark.django_db
def test_user_login(api_client):
    from apps.users.models import CustomUser
    user = CustomUser.objects.create_user(
        email="testuser@example.com",
        password="password123A!",
        is_active=True
    )

    url = reverse("token_obtain_pair")
    data = {"email": user.email, "password": "password123A!"}

    response = api_client.post(url, data)
    print(response.data)
    assert response.status_code == 200
    assert "access" in response.data


@pytest.mark.django_db
def test_login_wrong_password(api_client):
    user = UserFactory()
    data = {"email": user.email, "password": "wrong123A!"}
    url = reverse("token_obtain_pair")
    res = api_client.post(url, data)
    assert res.status_code == 401
    assert res.data["detail"] == "No active account found with the given credentials"


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
        "old_password": "password123A!",
        "new_password": "newsecure123A!"
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
        "new_password": "newpassword123A!"
    }
    response = api_client.post(url, data)
    assert response.status_code == 200


@pytest.mark.django_db
def test_register_existing_user(api_client, user):
    url = reverse("user-register")
    data = {
        "email": user.email,
        "password": "password123A!",
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
        "old_password": "wrongpasswordA2!",
        "new_password": "newsecure123A!"
    }
    response = auth_client.post(url, data)
    assert response.status_code == 400
    assert "old_password" in response.data


@pytest.mark.django_db
def test_reset_password_invalid_token(api_client):
    url = reverse("confirm-reset-password")
    data = {
        "token": "12345678-aaaa-bbbb-cccc-123456789000",
        "new_password": "somepass123A!"
    }
    response = api_client.post(url, data)
    assert response.status_code == 400
    assert "detail" in response.data
