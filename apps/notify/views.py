from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """The current user's recent notifications, with a mark-as-read action."""

    queryset = Notification.objects.none()  # actual rows come from get_queryset; set for schema generation
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ordering only; let pagination cap the page size so older notifications
        # remain reachable.
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=["post"], url_path="mark_as_read")
    def mark_as_read(self, request, pk=None):
        note = get_object_or_404(Notification, id=pk, user=request.user)
        note.is_read = True
        note.save()
        return Response({"status": "marked as read"})

    @action(detail=False, methods=["get"], url_path="unread_count")
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread": count})

    @action(detail=False, methods=["post"], url_path="mark_all_read")
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all marked as read"})
