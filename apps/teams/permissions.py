from rest_framework.permissions import BasePermission


class IsTeamAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not view.detail:
            return False
        team = view.get_object()
        return team.has_admin(request.user)
