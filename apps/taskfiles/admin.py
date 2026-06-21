from django.contrib import admin

from apps.taskfiles.models import TaskFile


@admin.register(TaskFile)
class TaskFileAdmin(admin.ModelAdmin):
    list_display = ("task", "file", "uploaded_by", "uploaded_at")
    search_fields = ("task__title", "uploaded_by__email")
    raw_id_fields = ("task", "uploaded_by")
