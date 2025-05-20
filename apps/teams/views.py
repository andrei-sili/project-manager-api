from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, PermissionDenied
from rest_framework.response import Response

from apps.teams.models import Team, TeamMembership
from apps.teams.permisions import IsTeamAdmin
from apps.teams.serializers import TeamSerializer, TeamCreateSerializer
from apps.users.models import CustomUser


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
            role='admin',
            status='accepted'
        )

    @action(detail=True, methods=['post'], permission_classes=[IsTeamAdmin])
    def invite_member(self, request, pk=None):
        team = self.get_object()
        email = request.data.get('email')
        role = request.data.get('role', 'developer')

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            user = CustomUser(email=email, first_name='', last_name='')
            user.set_unusable_password()
            user.save()

        if TeamMembership.objects.filter(team=team, user=user).exists():
            return Response({'error': 'User already invited or added'}, status=400)

        TeamMembership.objects.create(
            team=team,
            user=user,
            role=role,
            status='pending'
        )
        self.send_invite_email(user, team)

        return Response({'status': 'invitation sent', 'email': email})

    def send_invite_email(self, user, team):
        invite_link = f"{settings.FRONTEND_URL}/register?email={user.email}&team_id={team.id}"
        subject = f"You've been invited to join the team: {team.name}"
        message = f"Hi,\n\nYou've been invited to join '{team.name}' on Project Manager.\nAccept your invitation: {invite_link}"
        send_mail(subject, message, 'no-reply@yourapp.com', [user.email])

    @action(detail=True, methods=['post'], url_path='accept', permission_classes=[permissions.IsAuthenticated])
    def accept_invite(self, request, pk=None):
        team = self.get_object()
        try:
            membership = TeamMembership.objects.get(team=team, user=request.user)
            if membership.status != 'pending':
                return Response({'error': 'Invitation already processed'}, status=400)
            membership.status = 'accepted'
            membership.save()
            return Response({'status': 'accepted'})
        except TeamMembership.DoesNotExist:
            return Response({'error': 'No invitation found'}, status=404)

    @action(detail=True, methods=['post'], url_path='decline', permission_classes=[permissions.IsAuthenticated])
    def decline_invite(self, request, pk=None):
        team = self.get_object()
        try:
            membership = TeamMembership.objects.get(team=team, user=request.user)
            if membership.status != 'pending':
                return Response({'error': 'Invitation already processed'}, status=400)
            membership.status = 'declined'
            membership.save()
            return Response({'status': 'declined'})
        except TeamMembership.DoesNotExist:
            return Response({'error': 'No invitation found'}, status=404)

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
