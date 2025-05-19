from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from comments.models import Comment
from comments.permisions import IsProjectTeamMember
from comments.serializers import CommentCreateSerializer, CommentSerializer
from tasks.models import Task


class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_task(self):
        task = get_object_or_404(Task, pk=self.kwargs['task_pk'])
        if not task.project.team.members.filter(id=self.request.user.id).exists():
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
        serializer.save(task=task, user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)