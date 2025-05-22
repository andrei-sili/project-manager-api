from rest_framework import serializers

from apps.logs.models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    project = serializers.IntegerField(source="project.id", read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'user_email',
            'project',
            'action',
            'target_type',
            'target_id',
            'target_repr',
            'timestamp'
        ]

    def get_user_email(self, obj):
        return obj.user.email

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "full_name": obj.user.get_username(),
        }

