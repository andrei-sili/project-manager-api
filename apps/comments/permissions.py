from rest_framework.permissions import BasePermission


class IsProjectTeamMember(BasePermission):

    def has_object_permission(self, request, view, obj):
        task = getattr(obj, 'task', None)
        if not task:
            return False
        return task.project.team.members.filter(id=request.user.id).exists()
