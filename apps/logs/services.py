from apps.logs.models import ActivityLog


def log_activity(user, action, target_type, target_id, target_repr, project=None):
    """Record an action a user performed on an object in the activity log."""
    ActivityLog.objects.create(
        user=user,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_repr=target_repr,
        project=project
    )
