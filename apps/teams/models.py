from django.db import models

from apps.users.models import CustomUser


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teams_created')
    members = models.ManyToManyField(CustomUser, through='TeamMembership', related_name='teams_joined')

    def __str__(self):
        return self.name


class TeamMembership(models.Model):
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
    joined_at = models.DateTimeField(auto_now_add=True, editable=False)

    def is_pending(self):
        return self.status == self.STATUS_PENDING

    class Meta:
        unique_together = ('user', 'team')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.user.email} – {self.team.name} ({self.role}, {self.status})"
