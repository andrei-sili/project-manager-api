from django.db import models

from apps.tasks.models import Task
from apps.users.models import CustomUser


class Comment(models.Model):
    """A comment on a task; a non-null ``parent`` makes it a threaded reply."""

    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} → {self.task}: {self.text[:30]}"

