# backend/project/models.py

from django.db import models
from django.conf import settings

from apps.tasks.models import Task


class TimeEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="time_entries")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="time_entries")
    date = models.DateField()
    minutes = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        unique_together = ("user", "task", "date")

    def __str__(self):
        return f"{self.user} - {self.task} ({self.minutes} min on {self.date})"
