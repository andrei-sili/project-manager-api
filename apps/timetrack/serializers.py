# backend/project/serializers.py

from rest_framework import serializers
from .models import TimeEntry
from ..tasks.models import Task


class TimeEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())

    class Meta:
        model = TimeEntry
        fields = ['id', 'user', 'task', 'date', 'minutes', 'note', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']