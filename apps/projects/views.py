from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.projects.models import Project
from apps.projects.permissions import IsTeamMember, IsProjectAdmin
from apps.projects.serializers import ProjectCreateSerializer, ProjectSerializer, ProjectListSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """Projects the current user can access (those owned by teams they belong to)."""

    queryset = Project.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsTeamMember]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['team__id', 'created_by__id']
    ordering_fields = ['created_at', 'name']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return (
            Project.objects.filter(
                team__membership_set__user=self.request.user,
                team__membership_set__status='accepted',
            )
            .select_related('team', 'created_by')
            .prefetch_related(
                'tasks', 'tasks__assigned_to', 'tasks__created_by',
                'team__membership_set__user',
            )
            .distinct()
            .order_by('-id')
        )

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsProjectAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        team = serializer.validated_data.get('team')
        if not team.has_member(self.request.user):
            raise PermissionDenied("You are not a member of this team.")
        serializer.save(created_by=self.request.user)

