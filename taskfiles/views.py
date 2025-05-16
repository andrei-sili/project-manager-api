from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from comments.permisions import IsProjectTeamMember
from taskfiles.models import TaskFile
from taskfiles.serializers import TaskFileSerializer
from tasks.models import Task


class TaskFileViewSet(viewsets.ModelViewSet):
    serializer_class = TaskFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_queryset(self):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        return TaskFile.objects.filter(task=task)

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")

        serializer.save(task=task, uploaded_by=self.request.user)

