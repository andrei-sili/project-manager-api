import os

from django.http import Http404, FileResponse
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from apps.comments.permisions import IsProjectTeamMember
from apps.taskfiles.models import TaskFile
from apps.taskfiles.serializers import TaskFileSerializer
from apps.tasks.models import Task


def download_task_file(request, project_id, task_id, file_id):
    file_obj = get_object_or_404(
        TaskFile,
        id=file_id,
        task__id=task_id,
        task__project__id=project_id
    )

    file_path = file_obj.file.path
    file_name = os.path.basename(file_path)

    if not os.path.isfile(file_path):
        raise Http404("File not found on disk")

    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_name)


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

