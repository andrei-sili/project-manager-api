from rest_framework import serializers

from teams.models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = TeamMembership
        fields = [
            'user',
            'role',
            'joined_at'
        ]


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMembershipSerializer(source='membership_set', many=True)

    class Meta:
        model = Team
        fields = [
            'name',
            'created_by',
            'members'
        ]


class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['name']
