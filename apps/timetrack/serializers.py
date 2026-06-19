# backend/project/serializers.py

from rest_framework import serializers
from .models import TimeEntry
from ..tasks.models import Task


class TaskShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ("id", "title")


class TimeEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    task = TaskShortSerializer(read_only=True)
    task_id = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), source="task", write_only=True
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only allow logging time on tasks that belong to the user's teams.
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["task_id"].queryset = Task.objects.filter(
                project__team__members=request.user
            )

    class Meta:
        model = TimeEntry
        fields = ['id', 'user', 'task', 'task_id', 'date', 'minutes', 'note', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']