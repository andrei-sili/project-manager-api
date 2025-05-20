from rest_framework import viewsets, permissions
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityLog.objects.all().order_by('-timestamp')

        user_id = self.request.query_params.get('user')
        project_id = self.request.query_params.get('project')
        target_type = self.request.query_params.get('target_type')

        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        return queryset.order_by('-timestamp')
