from rest_framework import serializers

from apps.taskfiles.models import TaskFile


class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TaskFile
        fields = ['id', 'file', 'file_url', 'uploaded_by', 'uploaded_at']

    def get_uploaded_by(self, obj):
        return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}"

    def get_file_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def validate_file(self, value):
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("File too large (max 5MB)")
        return value