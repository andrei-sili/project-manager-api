from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from apps.comments.models import Comment
from apps.comments.permissions import IsProjectTeamMember
from apps.comments.serializers import CommentCreateSerializer, CommentSerializer
from apps.logs.services import log_activity

from apps.notify.services import notify_user
from apps.tasks.models import Task


class CommentViewSet(viewsets.ModelViewSet):
    """Threaded comments on a task (restricted to the project's team members)."""

    queryset = Comment.objects.none()  # actual rows come from get_queryset; set for schema generation
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_task(self):
        task = get_object_or_404(Task, id=self.kwargs["task_pk"], project_id=self.kwargs["project_pk"])
        if not task.project.team.has_member(self.request.user):
            raise PermissionDenied("You are not a member of this team.")
        return task

    def get_queryset(self):
        task = self.get_task()
        return Comment.objects.filter(task=task, parent__isnull=True).prefetch_related('replies').order_by(
            '-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        task = self.get_task()
        comment = serializer.save(task=task, user=self.request.user)

        assigned = task.assigned_to

        if assigned and assigned != self.request.user:
            notify_user(
                user=assigned,
                message=f"New comment on task: {task.title}",
                email_subject="New Comment on Your Task",
                email_body=f"{self.request.user.first_name} commented on your task '{task.title}' in project '{task.project.name}'."
            )

        log_activity(
            user=self.request.user,
            action='commented',
            target_type='comment',
            target_id=comment.id,
            target_repr=f"Comment on task: {task.title}",
            project=task.project
        )

    def perform_destroy(self, instance):
        log_activity(
            user=self.request.user,
            action='deleted',
            target_type='comment',
            target_id=instance.id,
            target_repr=f"Comment: {instance.text[:30]}",
            project=instance.task.project
        )
        instance.delete()

