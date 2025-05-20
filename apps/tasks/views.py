from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied

from apps.logs.services import log_activity
from apps.notify.services import notify_user
from apps.projects.models import Project
from apps.projects.permisions import IsTeamMember
from apps.tasks.models import Task
from apps.tasks.permisions import IsTaskCreatorOrAssignee
from apps.tasks.serializers import TaskSerializer, TaskCreateSerializer


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

        task = serializer.save(created_by=self.request.user, project=project)

        if assigned_user and assigned_user != self.request.user:
            notify_user(
                user=assigned_user,
                message=f"New task assigned: {task.title}",
                email_subject="New Task Assigned",
                email_body=f"You have been assigned a new task in project '{project.name}'."
            )

        log_activity(
            user=self.request.user,
            action='created',
            target_type='task',
            target_id=task.id,
            target_repr=f"Task: {task.title}",
            project=project
        )

    def perform_update(self, serializer):
        task = serializer.save()

        log_activity(
            user=self.request.user,
            action='updated',
            target_type='task',
            target_id=task.id,
            target_repr=f"Task: {task.title}",
            project=task.project
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='deleted',
            target_type='task',
            target_id=instance.id,
            target_repr=f"Task: {instance.title}",
            project=instance.project
        )
        instance.delete()

