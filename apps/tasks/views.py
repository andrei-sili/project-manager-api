from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied

from apps.logs.services import log_activity
from apps.notify.services import notify_user
from apps.projects.models import Project
from apps.projects.permissions import IsTeamMember
from apps.tasks.models import Task
from apps.tasks.permissions import IsTaskCreatorOrAssignee
from apps.tasks.serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """Tasks within a project. Create/update/delete emit notifications and activity logs."""

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
        return (
            Task.objects.filter(
                project__id=project_id,
                project__team__membership_set__user=self.request.user,
                project__team__membership_set__status='accepted',
            )
            .select_related('project', 'assigned_to', 'created_by')
            .order_by("-id")
        )

    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update':
            return TaskUpdateSerializer
        elif self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        """Validate team membership and assignee, save, notify the assignee and log the activity."""
        project_id = self.kwargs.get('project_pk')
        project = get_object_or_404(Project, id=project_id)

        if not project.team.has_member(self.request.user):
            raise PermissionDenied("You're not a member of this team.")

        assigned_user = serializer.validated_data.get('assigned_to')
        if assigned_user and not project.team.has_member(assigned_user):
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
        assigned_user = serializer.validated_data.get('assigned_to')
        if assigned_user and not serializer.instance.project.team.has_member(assigned_user):
            raise PermissionDenied("Assigned user is not part of this team.")

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


class MyTaskViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only list of tasks the current user created or is assigned to."""

    queryset = Task.objects.none()  # actual rows come from get_queryset; set for schema generation
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Task.objects.filter(Q(created_by=user) | Q(assigned_to=user))
            .select_related('project', 'assigned_to', 'created_by')
            .order_by("-created_at")
        )
