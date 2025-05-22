from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from apps.comments.permisions import IsProjectTeamMember
from apps.taskfiles.models import TaskFile
from apps.taskfiles.serializers import TaskFileSerializer
from apps.tasks.models import Task


class TaskFileViewSet(viewsets.ModelViewSet):
    serializer_class = TaskFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_queryset(self):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        return TaskFile.objects.filter(task=task).order_by("-uploaded_at")

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        serializer.save(task=task, uploaded_by=self.request.user)

