from django.db import models
from apps.users.models import CustomUser


class Notification(models.Model):
    TYPE_CHOICES = [
        ('general', 'General'),
        ('task', 'Task'),
        ('comment', 'Comment'),
        ('invite', 'Invite'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='general')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.type} - {self.message[:30]}"
