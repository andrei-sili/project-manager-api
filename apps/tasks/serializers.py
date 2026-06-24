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
    can_manage = serializers.SerializerMethodField()

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
            'can_manage',
        ]

    def get_project(self, obj) -> dict:
        return {
            "id": obj.project.id,
            "name": obj.project.name
        }

    def get_can_manage(self, obj) -> bool:
        """Whether the requesting user (admin/manager) may edit/delete this task."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        # Memoize per team within one serialization pass (avoids N+1 in lists).
        cache = self.context.setdefault("_can_manage_cache", {})
        team_id = obj.project.team_id
        if team_id not in cache:
            cache[team_id] = obj.project.team.can_manage_tasks(request.user)
        return cache[team_id]


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


class TaskUpdateSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'assigned_to',
        ]

    # No past-date check on update: a task may already be overdue, and editing
    # other fields must not be blocked by its date. Creation still requires a
    # future due date.


class TaskStatusSerializer(serializers.ModelSerializer):
    """Developers may only move a task between Kanban columns."""

    class Meta:
        model = Task
        fields = ['status']