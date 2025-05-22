import pytest
import asyncio
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

from apps.notify.services import notify_user
from tests.factories import UserFactory
from config.asgi import application

User = get_user_model()


@pytest.mark.asyncio
async def test_websocket_connection_rejected_without_token():
    communicator = WebsocketCommunicator(application, "/ws/notifications/")
    connected, _ = await communicator.connect()
    assert connected is False


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_connection_success():
    user = await database_sync_to_async(UserFactory)()
    token = AccessToken.for_user(user)
    token["user_id"] = str(user.id)

    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, _ = await communicator.connect()

    assert connected is True
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_websocket_receives_notification():
    user = await database_sync_to_async(UserFactory)()
    token = AccessToken.for_user(user)
    token["user_id"] = str(user.id)

    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, _ = await communicator.connect()
    assert connected

    await database_sync_to_async(notify_user)(
        user=user,
        message="Hello WebSocket",
        type="general",
        save=True
    )

    response = await communicator.receive_json_from()
    assert response["type"] == "general"
    assert response["message"] == "Hello WebSocket"
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_invalid_token_should_return_anonymous():
    communicator = WebsocketCommunicator(application, "/ws/notifications/?token=invalid.token.here")
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_notification_not_sent_if_user_not_authenticated():
    communicator = WebsocketCommunicator(application, "/ws/notifications/")
    connected, _ = await communicator.connect()
    assert connected is False
    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_multiple_users_receive_their_own_notifications():
    user1 = await database_sync_to_async(UserFactory)()
    user2 = await database_sync_to_async(UserFactory)()

    token1 = str(AccessToken.for_user(user1))
    token2 = str(AccessToken.for_user(user2))

    comm1 = WebsocketCommunicator(application, f"/ws/notifications/?token={token1}")
    comm2 = WebsocketCommunicator(application, f"/ws/notifications/?token={token2}")

    connected1, _ = await comm1.connect()
    connected2, _ = await comm2.connect()
    assert connected1 and connected2

    await database_sync_to_async(notify_user)(
        user=user1,
        message="Message for user1",
        type="info",
        save=False
    )

    response1 = await comm1.receive_json_from()
    assert response1["type"] == "info"
    assert response1["message"] == "Message for user1"

    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(comm2.receive_json_from(), timeout=1)

    await comm1.disconnect()
    await comm2.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_authenticated_user_in_scope():
    user = await database_sync_to_async(UserFactory)()
    token = str(AccessToken.for_user(user))
    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.disconnect()
