from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from projects.models import Project
from projects.permisions import IsTeamMember
from tasks.models import Task
from tasks.permisions import IsTaskCreatorOrAssignee
from tasks.serializers import TaskSerializer, TaskCreateSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'project']
    ordering_fields = ['due_date', 'created_at']
    search_fields = ['title', 'description']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsTaskCreatorOrAssignee()]
        return [permissions.IsAuthenticated(), IsTeamMember()]

    def get_queryset(self):
        project_id = self.kwargs.get('project_pk')
        return Task.objects.filter(project__id=project_id, project__team__members=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_pk')
        project = Project.objects.get(id=project_id)

        if not project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You're not a member of this team.")

        assigned_user = serializer.validated_data.get('assigned_to')
        if assigned_user and not project.team.members.filter(id=assigned_user.id).exists():
            raise PermissionDenied("Assigned user is not part of this team.")

        serializer.save(created_by=self.request.user, project=project)


