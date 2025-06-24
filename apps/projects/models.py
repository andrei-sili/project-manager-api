from django.db import models

from apps.teams.models import Team
from apps.users.models import CustomUser


class Project(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='project_created')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

