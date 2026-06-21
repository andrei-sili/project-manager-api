from django.contrib import admin

from apps.projects.models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "team", "created_by", "due_date", "created_at")
    list_filter = ("team",)
    search_fields = ("name", "description")
    date_hierarchy = "created_at"
