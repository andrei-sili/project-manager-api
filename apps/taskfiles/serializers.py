import os

from rest_framework import serializers

from apps.taskfiles.models import TaskFile

# SVG is intentionally excluded: it can carry inline <script> and would
# execute in the app's origin (stored XSS) if ever rendered.
ALLOWED_FILE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".pdf", ".txt", ".csv", ".md",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".zip",
}


class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TaskFile
        fields = ['id', 'file', 'file_url', 'uploaded_by', 'uploaded_at']

    def get_uploaded_by(self, obj) -> str:
        return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}"

    def get_file_url(self, obj) -> str:
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def validate_file(self, value):
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("File too large (max 5MB)")
        extension = os.path.splitext(value.name)[1].lower()
        if extension not in ALLOWED_FILE_EXTENSIONS:
            raise serializers.ValidationError("File type not allowed.")
        return value