from django.core.validators import MinValueValidator
from django.db import models
from django.conf import settings

from apps.tasks.models import Task


class TimeEntry(models.Model):
    """Time (in minutes) logged by a user against a task on a given day."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="time_entries")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="time_entries")
    date = models.DateField()
    minutes = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["user", "date"]),
        ]
        # No (user, task, date) uniqueness on purpose: a user may log several
        # separate sessions (each with its own note) for the same task in a day.

    def __str__(self):
        return f"{self.user} - {self.task} ({self.minutes} min on {self.date})"
