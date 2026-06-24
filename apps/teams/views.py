import uuid

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.notify.services import notify_user
from apps.teams.models import Team, TeamMembership
from apps.teams.permissions import IsTeamAdmin
from apps.users.throttles import InviteRateThrottle
from drf_spectacular.utils import OpenApiResponse, extend_schema

from apps.teams.serializers import TeamSerializer, TeamCreateSerializer, InviteMemberSerializer
from apps.users.models import CustomUser
from django.db.models import Q


def _inviter_name(membership):
    inviter = membership.invited_by
    if not inviter:
        return "A teammate"
    return f"{inviter.first_name} {inviter.last_name}".strip() or inviter.email


def _invitee_name(membership):
    user = membership.user
    return f"{user.first_name} {user.last_name}".strip() or user.email


class TeamViewSet(viewsets.ModelViewSet):
    """Teams the user belongs to, plus actions to invite, accept/decline, remove and change roles."""

    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        return (
            Team.objects.filter(Q(members=self.request.user) | Q(created_by=self.request.user))
            .select_related('created_by')
            .prefetch_related('membership_set__user')
            .distinct()
            .order_by('-id')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        # Name uniqueness is enforced by the serializer (Team.name is unique),
        # which returns a clean 400 instead of a 500.
        team = serializer.save(created_by=self.request.user)
        TeamMembership.objects.create(
            team=team,
            user=self.request.user,
            role='admin',
            status='accepted'
        )

    @extend_schema(
        request=InviteMemberSerializer,
        responses={200: OpenApiResponse(description="Invitation sent.")},
    )
    @action(detail=True, methods=['post'], url_path='invite-member',
            permission_classes=[IsTeamAdmin], throttle_classes=[InviteRateThrottle])
    def invite_member(self, request, pk=None):
        team = self.get_object()
        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        role = serializer.validated_data['role']

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            user = CustomUser(email=email, first_name='', last_name='')
            user.set_unusable_password()
            user.save()

        if TeamMembership.objects.filter(team=team, user=user).exists():
            raise ValidationError("User already invited or added.")

        membership = TeamMembership.objects.create(
            team=team,
            user=user,
            role=role,
            status='pending',
            invited_by=request.user,
            invite_token=uuid.uuid4(),
        )
        self.send_invite_email(membership)

        return Response({'status': 'invitation sent', 'email': email})

    def send_invite_email(self, membership):
        team = membership.team
        accept_link = f"{settings.FRONTEND_URL}/invite/accept?token={membership.invite_token}"
        decline_link = f"{settings.FRONTEND_URL}/invite/decline?token={membership.invite_token}"
        subject = f"You're invited to the team '{team.name}'"
        message = (
            f"Hi,\n\n{_inviter_name(membership)} invited you to join the team "
            f"'{team.name}' as {membership.get_role_display()} on Project Manager.\n\n"
            f"Accept:  {accept_link}\n"
            f"Decline: {decline_link}\n"
        )
        send_mail(subject, message, None, [membership.user.email])  # None -> DEFAULT_FROM_EMAIL

    @action(detail=True, methods=['post'], url_path='accept-invite', permission_classes=[permissions.IsAuthenticated])
    def accept_invite(self, request, pk=None):
        team = self.get_object()
        membership = TeamMembership.objects.filter(team=team, user=request.user).first()
        if not membership:
            raise NotFound("No invitation found.")
        if membership.status != 'pending':
            raise ValidationError("Invitation already processed.")
        membership.status = 'accepted'
        membership.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'], url_path='decline-invite', permission_classes=[permissions.IsAuthenticated])
    def decline_invite(self, request, pk=None):
        team = self.get_object()
        membership = TeamMembership.objects.filter(team=team, user=request.user).first()
        if not membership:
            raise NotFound("No invitation found.")
        if membership.status != 'pending':
            raise ValidationError("Invitation already processed.")
        membership.status = 'declined'
        membership.save()
        return Response({'status': 'declined'})

    @staticmethod
    def _is_last_admin(team):
        return TeamMembership.objects.filter(
            team=team, role='admin', status='accepted'
        ).count() <= 1

    @action(detail=True, methods=['post'], url_path='remove-member', permission_classes=[IsTeamAdmin])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')

        if str(request.user.id) == str(user_id):
            raise ValidationError("Admin cannot remove themselves.")

        membership = TeamMembership.objects.filter(team=team, user_id=user_id).first()
        if not membership:
            raise NotFound("Membership not found.")
        if membership.role == 'admin' and self._is_last_admin(team):
            raise ValidationError("Cannot remove the last admin of the team.")
        membership.delete()
        return Response({'status': 'member removed'})

    @action(detail=True, methods=['post'], url_path='change-role', permission_classes=[IsTeamAdmin])
    def change_role(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')

        if new_role not in dict(TeamMembership.ROLE_CHOICES):
            raise ValidationError("Invalid role.")

        membership = TeamMembership.objects.filter(team=team, user_id=user_id).first()
        if not membership:
            raise NotFound("Membership not found.")
        if membership.status != 'accepted':
            raise ValidationError("Can only change the role of an active member.")
        if membership.role == 'admin' and new_role != 'admin' and self._is_last_admin(team):
            raise ValidationError("The team must keep at least one admin.")
        membership.role = new_role
        membership.save()
        return Response({'status': f'Role changed to {new_role}'})

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()

        if not team.has_admin(request.user):
            raise PermissionDenied("You must be team admin to delete this team.")

        team_name = team.name
        team.delete()
        return Response(
            {"detail": f"Team '{team_name}' was deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


def _pending_invite(token):
    return (
        TeamMembership.objects
        .select_related('team', 'user', 'invited_by')
        .filter(invite_token=token)
        .first()
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def invitation_detail(request, token):
    """Public invite details for the email link landing page."""
    membership = _pending_invite(token)
    if not membership:
        return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'team': membership.team.name,
        'role': membership.role,
        'status': membership.status,
        'email': membership.user.email,
        'invited_by': _inviter_name(membership),
        'has_account': membership.user.has_usable_password(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invitation_accept(request, token):
    """Accept an invitation as the already-registered, logged-in invitee."""
    membership = _pending_invite(token)
    if not membership:
        return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)
    if membership.user_id != request.user.id:
        return Response({'detail': 'This invitation is for a different account.'},
                        status=status.HTTP_403_FORBIDDEN)
    if membership.status != 'pending':
        return Response({'detail': 'Invitation already handled.'}, status=status.HTTP_400_BAD_REQUEST)
    membership.status = 'accepted'
    membership.invite_token = None
    membership.save(update_fields=['status', 'invite_token'])
    return Response({'status': 'accepted', 'team_id': membership.team_id})


@api_view(['POST'])
@permission_classes([AllowAny])
def invitation_decline(request, token):
    """Decline an invitation from the email link and notify the inviter."""
    membership = _pending_invite(token)
    if not membership:
        return Response({'detail': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)
    if membership.status != 'pending':
        return Response({'detail': 'Invitation already handled.'}, status=status.HTTP_400_BAD_REQUEST)

    team_name = membership.team.name
    invitee = _invitee_name(membership)
    inviter = membership.invited_by
    membership.status = 'declined'
    membership.invite_token = None
    membership.save(update_fields=['status', 'invite_token'])

    if inviter:
        notify_user(
            user=inviter,
            message=f"{invitee} declined your invitation to '{team_name}'.",
            type='invite',
            email_subject="Invitation declined",
            email_body=f"{invitee} declined your invitation to join '{team_name}'.",
        )
    return Response({'status': 'declined'})
