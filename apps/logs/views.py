from rest_framework import viewsets, permissions

from apps.logs.models import ActivityLog
from apps.logs.serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only activity/audit log, filterable by user, project or target type."""

    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only logs for projects on teams the user is an accepted member of.
        queryset = (
            ActivityLog.objects.filter(
                project__team__membership_set__user=self.request.user,
                project__team__membership_set__status='accepted',
            )
            .select_related('user', 'project')
            .order_by('-timestamp')
        )

        user_id = self.request.query_params.get('user')
        project_id = self.request.query_params.get('project')
        target_type = self.request.query_params.get('target_type')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        return queryset
