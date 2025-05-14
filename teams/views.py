from django.db.migrations import serializer
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from teams import serializers
from teams.models import Team, TeamMembership
from teams.permisions import IsTeamAdmin
from teams.serializers import TeamSerializer, TeamCreateSerializer
from users.models import CustomUser


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name")
        if Team.objects.filter(name=name).exists():
            raise APIException("A team with this name already exists.")
        team = serializer.save(created_by=self.request.user)
        TeamMembership.objects.create(
            team=team,
            user=self.request.user,
            role='admin'
        )

    @action(detail=True, methods=['post'], permission_classes=[IsTeamAdmin])
    def add_member(self, request):
        team = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'developer')

        try:
            user = CustomUser.objects.get(id=user_id)
            if TeamMembership.objects.filter(team=team, user=user).exists():
                return Response({'error': 'User already in team'}, status=status.HTTP_400_BAD_REQUEST)

            TeamMembership.objects.create(team=team, user=user, role=role)
            return Response({'status': 'member added'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsTeamAdmin])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')

        if str(request.user.id) == str(user_id):
            return Response({'error': 'Admin cannot remove themselves.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            membership = TeamMembership.objects.get(team=team, user_id=user_id)
            membership.delete()
            return Response({'status': 'member removed'})
        except TeamMembership.DoesNotExist:
            return Response({'error': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsTeamAdmin])
    def change_role(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')

        if new_role not in dict(TeamMembership.ROLE_CHOICES):
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            membership = TeamMembership.objects.get(team=team, user_id=user_id)
            membership.role = new_role
            membership.save()
            return Response({'status': f'Role changed to {new_role}'})
        except TeamMembership.DoesNotExist:
            return Response({'error': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()

        is_admin = TeamMembership.objects.filter(
            team=team,
            user=request.user,
            role='admin'
        ).exists()

        if not is_admin:
            raise PermissionDenied("You must be team admin to delete this team.")

        team_name = team.name
        team.delete()
        return Response(
            {"detail": f"Team '{team_name}' was deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
