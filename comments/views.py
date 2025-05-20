from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.core.mail import send_mail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from comments.models import Comment
from comments.permisions import IsProjectTeamMember
from comments.serializers import CommentCreateSerializer, CommentSerializer
from notify.services import notify_user
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
        comment = serializer.save(task=task, user=self.request.user)

        assigned = task.assigned_to

        if assigned and assigned != self.request.user:
            notify_user(
                user=assigned,
                message=f"New comment on task: {task.title}",
                email_subject="New Comment on Your Task",
                email_body=f"{self.request.user.first_name} commented on your task '{task.title}' in project '{task.project.name}'."
            )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)