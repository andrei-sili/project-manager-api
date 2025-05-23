from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.teams.models import TeamMembership
from apps.users.models import CustomUser, PasswordResetToken
from apps.users.serializers import UserSerializer, UserRegisterSerializer, UserChangePasswordSerializer, \
    ConfirmPasswordResetSerializer, RequestPasswordResetSerializer


class UserViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='register', permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='update-profile',
            permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='change-password',
            permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        serializer = UserChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({'detail': 'If that email exists, a reset link was sent.'}, status=status.HTTP_200_OK)

            token = PasswordResetToken.objects.create(user=user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"


            send_mail(
                subject="Password Reset Request",
                message=f"Click the link to reset your password: {reset_link}",
                from_email="no-reply@example.com",
                recipient_list=[email],
            )

            return Response({'detail': 'Reset link sent if email exists.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                token_obj = PasswordResetToken.objects.get(token=token)
            except PasswordResetToken.DoesNotExist:
                return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)

            if token_obj.is_expired():
                token_obj.delete()
                return Response({'detail': 'Token expired.'}, status=status.HTTP_400_BAD_REQUEST)

            user = token_obj.user
            user.set_password(new_password)
            user.save()
            token_obj.delete()

            return Response({'detail': 'Password reset successful.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterAndAcceptInviteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        team_id = request.data.get("team_id")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid invitation."}, status=status.HTTP_404_NOT_FOUND)

        if user.has_usable_password():
            return Response({"error": "User already registered."}, status=status.HTTP_400_BAD_REQUEST)

        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.save()

        try:
            membership = TeamMembership.objects.get(user=user, team_id=team_id)
            if membership.status != 'pending':
                return Response({'error': 'Invitation already handled.'}, status=status.HTTP_400_BAD_REQUEST)
            membership.status = 'accepted'
            membership.save()
        except TeamMembership.DoesNotExist:
            return Response({'error': 'No pending invite found.'}, status=status.HTTP_404_NOT_FOUND)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        })