import pytest
from django.urls import reverse
from tests.factories import UserFactory


@pytest.mark.django_db
def test_user_register(api_client):
    from apps.users.models import CustomUser, EmailVerificationToken
    url = reverse("user-register")
    data = {
        "email": "newuser@example.com",
        "password": "test12345A!",
        "first_name": "John",
        "last_name": "Doe"
    }
    response = api_client.post(url, data)
    assert response.status_code == 201
    # Account is created inactive and a verification token is issued (no auto-login).
    user = CustomUser.objects.get(email="newuser@example.com")
    assert user.is_active is False
    assert EmailVerificationToken.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_verify_email_activates_account(api_client):
    from apps.users.models import CustomUser, EmailVerificationToken
    user = CustomUser.objects.create_user(
        email="verify@example.com", password="password123A!", is_active=False
    )
    token = EmailVerificationToken.objects.create(user=user)

    res = api_client.post(reverse("user-verify-email"), {"token": str(token.token)})
    assert res.status_code == 200

    user.refresh_from_db()
    assert user.is_active is True
    assert not EmailVerificationToken.objects.filter(id=token.id).exists()


@pytest.mark.django_db
def test_verify_email_invalid_token(api_client):
    res = api_client.post(
        reverse("user-verify-email"),
        {"token": "12345678-aaaa-bbbb-cccc-123456789000"},
    )
    assert res.status_code == 400


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
    data = {"email": "x@y.com", "password": "A1!" + "a" * 200, "first_name": "Ana",
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
def test_update_profile_email_readonly(auth_client):
    url = reverse("user-update-profile")
    res = auth_client.patch(url, {"email": "hacker@example.com"})
    assert res.status_code == 400
    assert "email" in res.data



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


@pytest.mark.django_db
def test_logout_blacklists_refresh_token(api_client):
    from apps.users.models import CustomUser
    from rest_framework_simplejwt.tokens import RefreshToken

    user = CustomUser.objects.create_user(
        email="logout@example.com", password="password123A!", is_active=True
    )
    refresh = str(RefreshToken.for_user(user))

    res = api_client.post(reverse("logout"), {"refresh": refresh})
    assert res.status_code == 200

    # A blacklisted refresh token can no longer be exchanged for a new access token.
    res2 = api_client.post(reverse("token_refresh"), {"refresh": refresh})
    assert res2.status_code == 401


@pytest.mark.django_db
def test_refresh_rotates_refresh_token(api_client):
    from apps.users.models import CustomUser
    from rest_framework_simplejwt.tokens import RefreshToken

    user = CustomUser.objects.create_user(
        email="rotate@example.com", password="password123A!", is_active=True
    )
    refresh = str(RefreshToken.for_user(user))

    res = api_client.post(reverse("token_refresh"), {"refresh": refresh})
    assert res.status_code == 200
    # Rotation issues a brand-new refresh token alongside the access token.
    assert "refresh" in res.data
    assert res.data["refresh"] != refresh


@pytest.mark.django_db
def test_old_refresh_token_blacklisted_after_rotation(api_client):
    from apps.users.models import CustomUser
    from rest_framework_simplejwt.tokens import RefreshToken

    user = CustomUser.objects.create_user(
        email="rotate2@example.com", password="password123A!", is_active=True
    )
    refresh = str(RefreshToken.for_user(user))

    first = api_client.post(reverse("token_refresh"), {"refresh": refresh})
    new_refresh = first.data["refresh"]

    # The original token is blacklisted after rotation and can no longer be reused.
    reused = api_client.post(reverse("token_refresh"), {"refresh": refresh})
    assert reused.status_code == 401

    # The rotated token is still valid.
    ok = api_client.post(reverse("token_refresh"), {"refresh": new_refresh})
    assert ok.status_code == 200
