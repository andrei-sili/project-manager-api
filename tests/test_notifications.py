import pytest
from django.urls import reverse
from unittest.mock import patch, AsyncMock
from tests.factories import UserFactory, NotificationFactory
from apps.notify.models import Notification
from apps.notify.services import notify_user


@pytest.mark.django_db
def test_notify_user_creates_notification_in_db():
    user = UserFactory()
    notify_user(
        user=user,
        message="Test notification",
        type="general",
        save=True
    )
    note = Notification.objects.get(user=user)
    assert note.message == "Test notification"
    assert note.type == "general"


@pytest.mark.django_db
def test_list_notifications_for_current_user(auth_client):
    user = auth_client.handler._force_user
    NotificationFactory(user=user)
    NotificationFactory(user=user)
    NotificationFactory()  # different user
    url = reverse("notifications-list")
    res = auth_client.get(url)
    assert res.status_code == 200
    assert res.data["count"] == 2


@pytest.mark.django_db
def test_mark_notification_as_read(auth_client):
    user = auth_client.handler._force_user
    note = NotificationFactory(user=user, is_read=False)
    url = reverse("notifications-mark-as-read", args=[note.id])
    res = auth_client.post(url)
    assert res.status_code == 200
    note.refresh_from_db()
    assert note.is_read is True


@pytest.mark.django_db
def test_mark_notification_not_owned_should_fail(api_client):
    note = NotificationFactory()
    other_user = UserFactory()
    api_client.force_authenticate(user=other_user)
    url = reverse("notifications-mark-as-read", args=[note.id])
    res = api_client.post(url)
    assert res.status_code == 404


@pytest.mark.django_db
def test_notification_serializer_fields(auth_client):
    user = auth_client.handler._force_user
    note = NotificationFactory(user=user, is_read=False)
    url = reverse("notifications-list")
    res = auth_client.get(url)
    assert res.status_code == 200
    data = res.data["results"][0]
    assert "message" in data
    assert "type" in data
    assert "is_read" in data
    assert "created_at" in data


@pytest.mark.django_db
@patch("apps.notify.services.get_channel_layer")
def test_notify_user_sends_ws_message(mock_get_channel_layer):
    mock_layer = mock_get_channel_layer.return_value
    mock_layer.group_send = AsyncMock()
    user = UserFactory()

    notify_user(
        user=user,
        message="WebSocket test",
        type="general",
        save=False
    )

    mock_layer.group_send.assert_called_once()
    group, payload = mock_layer.group_send.call_args[0]
    assert group == f"user_{user.id}"
    assert "message" in payload["data"]


@pytest.mark.django_db
def test_notify_user_does_not_save_to_db_when_save_false():
    user = UserFactory()
    notify_user(user=user, message="No DB", type="general", save=False)
    assert Notification.objects.filter(user=user).count() == 0


@pytest.mark.django_db
@patch("apps.notify.services.get_channel_layer", return_value=None)
def test_notify_user_handles_missing_channel_layer(mock_layer):
    user = UserFactory()
    try:
        notify_user(user=user, message="No WS", type="general", save=True)
    except Exception as e:
        pytest.fail(f"Should not raise error: {e}")


@pytest.mark.django_db
def test_notify_user_without_email_fields():
    user = UserFactory()
    notify_user(user=user, message="No email fields", type="general", save=True)
    note = Notification.objects.get(user=user)
    assert note.message == "No email fields"


@pytest.mark.django_db
def test_notify_user_with_email_subject_and_body():
    user = UserFactory()
    notify_user(
        user=user,
        message="Email check",
        email_subject="Special Subject",
        email_body="Special Body",
        type="invite",
        save=True
    )
    note = Notification.objects.get(user=user)
    assert note.message == "Email check"
    assert note.type == "invite"


@pytest.mark.django_db
def test_access_notifications_without_login(api_client):
    url = reverse("notifications-list")
    res = api_client.get(url)
    assert res.status_code == 401


@pytest.mark.django_db
def test_mark_as_read_requires_auth(api_client):
    note = NotificationFactory()
    url = reverse("notifications-mark-as-read", args=[note.id])
    res = api_client.post(url)
    assert res.status_code == 401


@pytest.mark.django_db
def test_notify_user_none_user_should_fail():
    with pytest.raises(ValueError):
        notify_user(user=None, message="No user", type="general")