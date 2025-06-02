from rest_framework import serializers

from apps.projects.models import Project
from apps.tasks.serializers import TaskSerializer
from apps.teams.serializers import TeamSerializer


class ProjectSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    created_by = serializers.SerializerMethodField()
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

    def get_created_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['name', 'description', 'team']
