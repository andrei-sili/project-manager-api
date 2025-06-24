from rest_framework import serializers

from apps.teams.models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    role = serializers.CharField()
    joined_at = serializers.DateTimeField()

    class Meta:
        model = TeamMembership
        fields = [
            'user',
            'role',
            'joined_at',
        ]

    def get_user(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "first_name": obj.user.first_name or "",
                "last_name": obj.user.last_name or "",
                "email": obj.user.email,
            }
        return None


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMembershipSerializer(source='membership_set', many=True)
    created_by = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'created_by',
            'members',
            'is_admin',
        ]

    def get_created_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"

    def get_is_admin(self, obj):
        user = self.context['request'].user
        return obj.membership_set.filter(user=user, role='admin').exists()


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=TeamMembership.ROLE_CHOICES)
