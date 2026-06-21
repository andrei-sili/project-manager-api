from django.contrib import admin

from apps.tasks.models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "status", "priority", "assigned_to", "due_date")
    list_filter = ("status", "priority")
    search_fields = ("title", "description")
    raw_id_fields = ("project", "assigned_to", "created_by")
