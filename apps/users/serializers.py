import re

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

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


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    token = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'email',
            'first_name',
            'last_name',
            'password',
            'token']

        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'password': {'required': True},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def validate_password(self, value):
        return validate_password(value)


class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        return validate_password(value)


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmPasswordResetSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        return validate_password(value)


def validate_password(value):
    if len(value) < 8:
        raise serializers.ValidationError("Password too short (min 7 characters)")
    if len(value) > 16:
        raise serializers.ValidationError("Password too long (max 16 characters)")
    if not re.search(r"[A-Z]", value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r"\d", value):
        raise serializers.ValidationError("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return value