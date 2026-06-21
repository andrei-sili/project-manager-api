from django.contrib import admin

from apps.logs.models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "user", "action", "target_type", "target_repr", "project")
    list_filter = ("action", "target_type")
    search_fields = ("target_repr", "user__email")
    date_hierarchy = "timestamp"
