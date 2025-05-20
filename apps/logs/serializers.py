from rest_framework import serializers

from apps.logs.models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_email', 'action', 'target_type', 'target_repr', 'timestamp']

    def get_user_email(self, obj):
        return obj.user.email
