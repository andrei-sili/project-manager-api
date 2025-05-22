from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')[:20]

    @action(detail=True, methods=["post"], url_path="mark_as_read")
    def mark_as_read(self, request, pk=None):
        note = get_object_or_404(Notification, id=pk, user=request.user)
        note.is_read = True
        note.save()
        return Response({"status": "marked as read"})
