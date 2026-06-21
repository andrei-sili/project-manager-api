import os

from django.http import Http404, FileResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.comments.permissions import IsProjectTeamMember
from apps.taskfiles.models import TaskFile
from apps.taskfiles.serializers import TaskFileSerializer
from apps.tasks.models import Task


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_task_file(request, project_id, task_id, file_id):
    """Stream a task's file as an attachment, restricted to the project's team members."""
    file_obj = get_object_or_404(
        TaskFile,
        id=file_id,
        task__id=task_id,
        task__project__id=project_id
    )

    if not file_obj.task.project.team.has_member(request.user):
        raise PermissionDenied("You are not a member of this team.")

    file_path = file_obj.file.path
    file_name = os.path.basename(file_path)

    if not os.path.isfile(file_path):
        raise Http404("File not found on disk")

    # Always force a download (never inline render) and disable MIME sniffing so
    # an uploaded file (e.g. an SVG) can't execute as HTML in the app's origin.
    response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_name)
    response["X-Content-Type-Options"] = "nosniff"
    return response


class TaskFileViewSet(viewsets.ModelViewSet):
    """File attachments for a task (restricted to the project's team members)."""

    queryset = TaskFile.objects.none()  # actual rows come from get_queryset; set for schema generation
    serializer_class = TaskFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectTeamMember]

    def get_queryset(self):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.has_member(self.request.user):
            raise PermissionDenied("You are not a member of this team.")

        return TaskFile.objects.filter(task=task).order_by("-uploaded_at")

    def perform_create(self, serializer):
        task = get_object_or_404(Task, id=self.kwargs['task_pk'])

        if not task.project.team.has_member(self.request.user):
            raise PermissionDenied("You are not a member of this team.")

        serializer.save(task=task, uploaded_by=self.request.user)

