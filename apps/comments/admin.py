from django.contrib import admin

from apps.comments.models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("user", "task", "parent", "created_at")
    search_fields = ("text", "user__email")
    raw_id_fields = ("task", "user", "parent")
