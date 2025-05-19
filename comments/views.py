from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from comments.models import Comment
from comments.permisions import IsProjectTeamMember
from comments.serializers import CommentCreateSerializer, CommentSerializer
from tasks.models import Task


class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_queryset(self):
        task = get_object_or_404(Task, pk=self.kwargs['task_pk'])

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        return Comment.objects.filter(task=task, parent__isnull=True).prefetch_related('replies').order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CommentCreateSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        task_id = self.kwargs['task_pk']
        task = get_object_or_404(Task, id=task_id)

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        serializer.save(task=task, user=self.request.user)
