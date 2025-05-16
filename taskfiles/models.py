from django.db import models

from tasks.models import Task
from users.models import CustomUser


class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    file = models.FileField(upload_to='task_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} ({self.task})"

