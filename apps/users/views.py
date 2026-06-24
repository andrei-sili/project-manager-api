from django.conf import settings
from django.core.mail import send_mail
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.teams.models import TeamMembership
from apps.users.throttles import AuthRateThrottle, RegisterRateThrottle
from apps.users.turnstile import verify_turnstile
from apps.users.models import CustomUser, PasswordResetToken, EmailVerificationToken
from apps.users.serializers import (
    UserSerializer,
    UserRegisterSerializer,
    UserChangePasswordSerializer,
    ConfirmPasswordResetSerializer,
    RequestPasswordResetSerializer,
    RegisterAndAcceptInviteSerializer,
    VerifyEmailSerializer,
)


def send_verification_email(user):
    """Create a verification token and email the activation link to the user."""
    token = EmailVerificationToken.objects.create(user=user)
    link = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
    send_mail(
        subject="Verify your email",
        message=(
            "Welcome to Project Manager!\n\n"
            f"Confirm your email to activate your account:\n{link}\n\n"
            "The link expires in 24 hours."
        ),
        from_email=None,  # uses DEFAULT_FROM_EMAIL
        recipient_list=[user.email],
    )


class EmailAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    """On login failure, distinguish an unverified account (correct password but
    inactive) from bad credentials — only when the password matches, so it does
    not leak which emails exist."""

    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except AuthenticationFailed:
            user = CustomUser.objects.filter(email=attrs.get("email")).first()
            if user and not user.is_active and user.check_password(attrs.get("password", "")):
                raise AuthenticationFailed(
                    "Please verify your email before signing in — check your inbox for the link.",
                    code="email_not_verified",
                )
            raise


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login endpoint with a stricter per-IP throttle to slow brute-force."""

    throttle_classes = [AuthRateThrottle]
    serializer_class = EmailAwareTokenObtainPairSerializer


class UserViewSet(viewsets.ViewSet):
    """Self-service user endpoints: register, current profile, change password."""

    @extend_schema(
        request=UserRegisterSerializer,
        responses={201: OpenApiResponse(description="Account created; verification email sent.")},
    )
    @action(detail=False, methods=['post'], url_path='register',
            permission_classes=[permissions.AllowAny], throttle_classes=[RegisterRateThrottle])
    def register(self, request):
        verify_turnstile(request.data.get("turnstile_token"), request.META.get("REMOTE_ADDR"))
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        existing = CustomUser.objects.filter(email=data["email"]).first()
        if existing is None:
            send_verification_email(serializer.save())
        elif not existing.is_active:
            # Unverified account re-registering: refresh details and resend the link.
            existing.first_name = data["first_name"]
            existing.last_name = data["last_name"]
            existing.set_password(data["password"])
            existing.save()
            EmailVerificationToken.objects.filter(user=existing).delete()
            send_verification_email(existing)
        # An already-active email gets no mail; the response is identical either
        # way so registration cannot be used to probe which emails exist.

        return Response(
            {"detail": "Thanks! If that email can be registered, we've sent a verification "
                       "link — please check your inbox."},
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        request=VerifyEmailSerializer,
        responses={200: OpenApiResponse(description="Email verified; the account is active.")},
    )
    @action(detail=False, methods=['post'], url_path='verify-email',
            permission_classes=[permissions.AllowAny], throttle_classes=[AuthRateThrottle])
    def verify_email(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token_obj = EmailVerificationToken.objects.select_related('user').get(
                token=serializer.validated_data['token']
            )
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid or already-used verification link.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if token_obj.is_expired():
            token_obj.delete()
            return Response({'detail': 'Verification link expired. Please register again.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.user
        user.is_active = True
        user.save(update_fields=['is_active'])
        token_obj.delete()
        return Response({'detail': 'Email verified. You can now log in.'}, status=status.HTTP_200_OK)

    @extend_schema(responses={200: UserSerializer})
    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=UserSerializer, responses={200: UserSerializer})
    @action(detail=False, methods=['patch'], url_path='update-profile',
            permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=UserChangePasswordSerializer,
        responses={200: OpenApiResponse(description="Password changed successfully.")},
    )
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
    throttle_classes = [AuthRateThrottle]
    serializer_class = RequestPasswordResetSerializer

    @extend_schema(
        request=RequestPasswordResetSerializer,
        responses={200: OpenApiResponse(description="A reset link is sent if the email exists.")},
    )
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
                from_email=None,  # uses DEFAULT_FROM_EMAIL
                recipient_list=[email],
            )

            return Response({'detail': 'Reset link sent if email exists.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = ConfirmPasswordResetSerializer

    @extend_schema(
        request=ConfirmPasswordResetSerializer,
        responses={200: OpenApiResponse(description="Password reset successful.")},
    )
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
    throttle_classes = [AuthRateThrottle]
    serializer_class = RegisterAndAcceptInviteSerializer

    @extend_schema(request=RegisterAndAcceptInviteSerializer)
    def post(self, request):
        serializer = RegisterAndAcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        membership = (
            TeamMembership.objects.select_related('user')
            .filter(invite_token=data["token"]).first()
        )
        if not membership:
            return Response({"detail": "Invitation not found."}, status=status.HTTP_404_NOT_FOUND)
        if membership.status != 'pending':
            return Response({"detail": "Invitation already handled."}, status=status.HTTP_400_BAD_REQUEST)

        user = membership.user
        if user.has_usable_password():
            return Response({"detail": "Account already exists. Please sign in to accept."},
                            status=status.HTTP_400_BAD_REQUEST)

        # The invite email proves the address is the invitee's, so activate
        # directly without a separate verification step.
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.set_password(data["password"])
        user.is_active = True
        user.save()

        membership.status = 'accepted'
        membership.invite_token = None
        membership.save(update_fields=['status', 'invite_token'])

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "team_id": membership.team_id,
            "user": {
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        })
