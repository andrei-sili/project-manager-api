from rest_framework import serializers

from apps.projects.models import Project
from apps.tasks.serializers import TaskSerializer
from apps.teams.serializers import TeamSerializer
from apps.users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    created_by = UserSerializer(read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'team',
            'created_by',
            'created_at',
            'tasks',
        ]


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['name', 'description', 'team']
