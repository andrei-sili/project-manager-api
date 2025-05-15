from rest_framework import serializers

from projects.models import Project
from tasks.serializers import TaskSerializer
from teams.serializers import TeamSerializer


class ProjectSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    created_by = serializers.SerializerMethodField()
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'name',
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
