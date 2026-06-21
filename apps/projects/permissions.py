from rest_framework.permissions import BasePermission


class IsTeamMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'project'):  # e.g. Task
            return obj.project.team.has_member(request.user)
        elif hasattr(obj, 'team'):  # e.g. Project
            return obj.team.has_member(request.user)
        return False


class IsProjectAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.team.has_admin(request.user)
