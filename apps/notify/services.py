from django.core.mail import send_mail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from apps.notify.models import Notification


def notify_user(user, message, email_subject=None, email_body=None, type='general', save=True):
    """Notify a user: live over WebSocket, optionally by email, and persist a record."""
    if user is None:
        raise ValueError("User cannot be None")
    # WebSocket
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "notify",
                "data": {
                    "message": message,
                    "type": type,
                    "timestamp": str(timezone.now())
                }
            }
        )

    # Email
    if email_subject and email_body and user.email:
        send_mail(
            subject=email_subject,
            message=email_body,
            from_email=None,  # uses DEFAULT_FROM_EMAIL
            recipient_list=[user.email]
        )

    # DB
    if save:
        Notification.objects.create(user=user, message=message, type=type)


def notify_team(team, message, exclude_user=None, type='general'):
    """In-app/WebSocket notify every accepted team member (no email, to avoid spam)."""
    members = team.membership_set.filter(status='accepted').select_related('user')
    for membership in members:
        if exclude_user and membership.user_id == exclude_user.id:
            continue
        notify_user(membership.user, message, type=type)
