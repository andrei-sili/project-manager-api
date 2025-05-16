from rest_framework.permissions import BasePermission


class IsTeamMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'project'):  # e.g. Task
            return request.user in obj.project.team.members.all()
        elif hasattr(obj, 'team'):  # e.g. Project
            return request.user in obj.team.members.all()
        return False
