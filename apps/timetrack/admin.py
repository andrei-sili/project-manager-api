from django.contrib import admin

from apps.timetrack.models import TimeEntry


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "minutes", "date", "created_at")
    list_filter = ("date",)
    search_fields = ("user__email", "task__title")
    date_hierarchy = "date"
