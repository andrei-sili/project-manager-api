# backend/project/serializers.py

from rest_framework import serializers
from .models import TimeEntry


class TimeEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    task = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TimeEntry
        fields = ['id', 'user', 'task', 'date', 'minutes', 'note', 'created_at']
