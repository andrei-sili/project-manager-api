from rest_framework import viewsets, permissions
from rest_framework.response import Response


from users.serializers import UserSerializer


class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


