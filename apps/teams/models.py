import uuid

from django.db import models

from apps.users.models import CustomUser


class Team(models.Model):
    """A group of users that owns projects; members join through TeamMembership."""

    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teams_created')
    members = models.ManyToManyField(
        CustomUser, through='TeamMembership', through_fields=('team', 'user'),
        related_name='teams_joined',
    )

    def __str__(self):
        return self.name

    def has_member(self, user):
        """True if the user is an accepted member of this team."""
        return self.membership_set.filter(
            user=user, status=TeamMembership.STATUS_ACCEPTED
        ).exists()

    def has_admin(self, user):
        """True if the user is an accepted admin of this team."""
        return self.membership_set.filter(
            user=user,
            role=TeamMembership.ROLE_ADMIN,
            status=TeamMembership.STATUS_ACCEPTED,
        ).exists()

    def member_role(self, user):
        """Role of the user as an accepted member, or None if not a member."""
        membership = self.membership_set.filter(
            user=user, status=TeamMembership.STATUS_ACCEPTED
        ).first()
        return membership.role if membership else None

    def can_manage_tasks(self, user):
        """Admins and managers may create/edit/delete tasks."""
        return self.member_role(user) in (TeamMembership.ROLE_ADMIN, TeamMembership.ROLE_MANAGER)


class TeamMembership(models.Model):
    """A user's membership in a team: their role and invitation status."""

    ROLE_ADMIN = 'admin'
    ROLE_MANAGER = 'manager'
    ROLE_DEVELOPER = 'developer'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_MANAGER, 'Manager'),
        (ROLE_DEVELOPER, 'Developer'),
    ]
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_DECLINED = 'declined'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_DECLINED, 'Declined'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='membership_set')
    role = models.CharField(max_length=9, choices=ROLE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    invited_by = models.ForeignKey(
        CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_invites'
    )
    invite_token = models.UUIDField(null=True, blank=True, editable=False, db_index=True)
    joined_at = models.DateTimeField(auto_now_add=True, editable=False)

    def is_pending(self):
        return self.status == self.STATUS_PENDING

    class Meta:
        unique_together = ('user', 'team')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.user.email} – {self.team.name} ({self.role}, {self.status})"
