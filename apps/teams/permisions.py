from rest_framework.permissions import BasePermission
from .models import TeamMembership


class IsTeamAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not view.detail:
            return False
        team = view.get_object()
        return TeamMembership.objects.filter(
            team=team,
            user=request.user,
            role='admin'
        ).exists()
