from django.db import models

from apps.projects.models import Project
from apps.users.models import CustomUser


class Task(models.Model):
    """A unit of work on a project (a Kanban card): status, priority, assignee, due date."""

    STATUS_TODO = 'todo'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = [
        (STATUS_TODO, 'To Do'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done')
    ]
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High')
    ]
    title = models.CharField(max_length=255, blank=False)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=11, choices=STATUS_CHOICES, db_index=True)
    priority = models.CharField(max_length=6, choices=PRIORITY_CHOICES)
    due_date = models.DateTimeField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='task_created')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} (assigned to: {self.assigned_to})"
