from django.contrib import admin

from apps.teams.models import Team, TeamMembership


class TeamMembershipInline(admin.TabularInline):
    model = TeamMembership
    extra = 0


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by")
    search_fields = ("name",)
    inlines = [TeamMembershipInline]


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "team", "role", "status", "joined_at")
    list_filter = ("role", "status")
    search_fields = ("user__email", "team__name")
