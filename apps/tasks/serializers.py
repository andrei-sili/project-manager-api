from django.utils import timezone
from rest_framework import serializers

from apps.projects.models import Project
from apps.tasks.models import Task
from apps.users.models import CustomUser


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'first_name', 'last_name', 'email')


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserShortSerializer()
    created_by = serializers.StringRelatedField()
    project = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'assigned_to',
            'created_by',
            'project',
            'created_at',
        ]

    def get_project(self, obj):
        return {
            "id": obj.project.id,
            "name": obj.project.name
        }


class TaskCreateSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'project',
            'assigned_to',
            'status',
            'priority',
            'due_date'
        ]

    def validate_due_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value
