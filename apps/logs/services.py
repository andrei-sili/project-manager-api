from apps.logs.models import ActivityLog


def log_activity(user, action, target_type, target_id, target_repr, project=None):
    ActivityLog.objects.create(
        user=user,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_repr=target_repr,
        project=project
    )
