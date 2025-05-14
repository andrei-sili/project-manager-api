from rest_framework import serializers

from teams.models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = TeamMembership
        fields = [
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

    class Meta:
        model = Team
        fields = [
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


# teams/serializers.py

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=TeamMembership.ROLE_CHOICES)
