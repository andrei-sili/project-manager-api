from django.db import models

from users.models import CustomUser


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

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='membership_set')
    role = models.CharField(max_length=9, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        unique_together = ('user', 'team')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.user} - {self.team} ({self.role})"
