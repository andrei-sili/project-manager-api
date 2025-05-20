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

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # optional:  validation rules hier
        if len(value) < 7:
            raise serializers.ValidationError("Password too short (min 7 characters)")
        return value


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ConfirmPasswordResetSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        if len(value) < 7:
            raise serializers.ValidationError("Password too short")
        return value
