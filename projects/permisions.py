from rest_framework.permissions import BasePermission


class IsTeamMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user in obj.project.team.members.all()