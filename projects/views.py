from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from projects.models import Project
from projects.permisions import IsTeamMember
from projects.serializers import ProjectCreateSerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsTeamMember]

    def get_queryset(self):
        return Project.objects.filter(team__members=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        team = serializer.validated_data.get('team')
        if not team.members.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a member of this team.")
        serializer.save(created_by=self.request.user)
