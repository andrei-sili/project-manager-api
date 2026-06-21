from rest_framework.permissions import BasePermission


class IsProjectTeamMember(BasePermission):

    def has_object_permission(self, request, view, obj):
        task = getattr(obj, 'task', None)
        if not task:
            return False
        return task.project.team.has_member(request.user)


class IsCommentAuthor(BasePermission):
    """Only the comment's author may edit or delete it."""

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
