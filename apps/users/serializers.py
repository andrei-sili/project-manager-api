import re

from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.users.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'date_joined',
        ]

        read_only_fields = ['id', 'email', 'date_joined']

    def validate(self, attrs):
        for field in self.Meta.read_only_fields:
            if field in self.initial_data:
                raise serializers.ValidationError({field: "This field is read-only."})
        return super().validate(attrs)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'first_name',
            'last_name',
            'password',
        ]

        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'password': {'required': True},
        }

    def create(self, validated_data):
        # Inactive until the email is verified; the user can't log in before then.
        user = CustomUser.objects.create_user(is_active=False, **validated_data)
        return user

    def validate_password(self, value):
        return validate_password_strength(value)


class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()


class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        return validate_password_strength(value)


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmPasswordResetSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        return validate_password_strength(value)


# Upper bound guards against denial-of-service via very long passwords
# (the password hasher processes the entire string).
MAX_PASSWORD_LENGTH = 128


def validate_password_strength(value):
    if len(value) > MAX_PASSWORD_LENGTH:
        raise serializers.ValidationError(
            f"Password too long (max {MAX_PASSWORD_LENGTH} characters)."
        )
    # Django's configured validators: minimum length, common, numeric-only, similarity.
    try:
        django_validate_password(value)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))
    # Complexity rules layered on top of Django's validators.
    if not re.search(r"[A-Z]", value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r"\d", value):
        raise serializers.ValidationError("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return value


class RegisterAndAcceptInviteSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    def validate_password(self, value):
        return validate_password_strength(value)