from rest_framework import serializers

from apps.teams.models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    email = serializers.SerializerMethodField()
    id = serializers.IntegerField(source='user.id')

    class Meta:
        model = TeamMembership
        fields = [
            'id',
            'user',
            'email',
            'role',
            'joined_at',
        ]

    def get_email(self, obj):
        return obj.user.email


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMembershipSerializer(source='membership_set', many=True)
    created_by = serializers.SerializerMethodField()
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'created_by',
            'members',
        ]

    def get_created_by(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}"


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['name']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=TeamMembership.ROLE_CHOICES)
