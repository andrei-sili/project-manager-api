import pytest
from django.urls import reverse
from tests.factories import UserFactory, TeamFactory
from apps.teams.models import TeamMembership


@pytest.mark.django_db
def test_create_team(auth_client):
    url = reverse("teams-list")
    data = {"name": "Dev Team"}
    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["name"] == "Dev Team"


@pytest.mark.django_db
def test_list_teams(auth_client):
    TeamFactory.create_batch(2, created_by=auth_client.handler._force_user)
    url = reverse("teams-list")
    res = auth_client.get(url)
    assert res.status_code == 200
    assert len(res.data) >= 2


@pytest.mark.django_db
def test_add_member_to_team(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(
        team=team,
        user=auth_client.handler._force_user,
        role="admin",
        status="accepted"
    )

    url = reverse("teams-invite-member", args=[team.id])
    new_user = UserFactory()
    res = auth_client.post(url, {"email": new_user.email, "role": "developer"})
    assert res.status_code == 200
    assert TeamMembership.objects.filter(team=team, user=new_user).exists()


@pytest.mark.django_db
def test_add_existing_member_should_fail(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(
        team=team,
        user=auth_client.handler._force_user,
        role="admin",
        status="accepted"
    )

    new_user = UserFactory()
    TeamMembership.objects.create(team=team, user=new_user, role="developer", status="pending")
    url = reverse("teams-invite-member", args=[team.id])
    res = auth_client.post(url, {"email": new_user.email, "role": "developer"})
    assert res.status_code == 400
    assert "already" in str(res.data).lower()


@pytest.mark.django_db
def test_add_member_unauthorized_should_fail(api_client):
    team = TeamFactory()
    admin_user = UserFactory()
    TeamMembership.objects.create(
        team=team,
        user=admin_user,
        role="admin",
        status="accepted"
    )

    other_user = UserFactory()
    api_client.force_authenticate(user=other_user)
    url = reverse("teams-invite-member", args=[team.id])
    res = api_client.post(url, {"email": UserFactory().email, "role": "developer"})
    assert res.status_code == 404


@pytest.mark.django_db
def test_accept_invitation(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="pending")
    api_client.force_authenticate(user=user)
    url = reverse("teams-accept-invite", args=[team.id])
    res = api_client.post(url)
    assert res.status_code == 200
    membership = TeamMembership.objects.get(team=team, user=user)
    assert membership.status == "accepted"


@pytest.mark.django_db
def test_decline_invitation(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="pending")
    api_client.force_authenticate(user=user)
    url = reverse("teams-decline-invite", args=[team.id])
    res = api_client.post(url)
    assert res.status_code == 200
    membership = TeamMembership.objects.get(team=team, user=user)
    assert membership.status == "declined"


@pytest.mark.django_db
def test_remove_member(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="admin", status="accepted")
    member = UserFactory()
    TeamMembership.objects.create(team=team, user=member, role="developer", status="accepted")
    url = reverse("teams-remove-member", args=[team.id])
    res = auth_client.post(url, {"user_id": member.id})
    assert res.status_code == 200
    assert not TeamMembership.objects.filter(team=team, user=member).exists()


@pytest.mark.django_db
def test_change_member_role(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="admin", status="accepted")
    member = UserFactory()
    TeamMembership.objects.create(team=team, user=member, role="developer", status="accepted")
    url = reverse("teams-change-role", args=[team.id])
    res = auth_client.post(url, {"user_id": member.id, "role": "manager"})
    assert res.status_code == 200
    updated = TeamMembership.objects.get(team=team, user=member)
    assert updated.role == "manager"


@pytest.mark.django_db
def test_delete_team(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(
        team=team,
        user=auth_client.handler._force_user,
        role='admin',
        status='accepted'
    )

    url = reverse("teams-detail", args=[team.id])
    res = auth_client.delete(url)
    assert res.status_code == 204


@pytest.mark.django_db
def test_create_team_with_duplicate_name_should_fail(auth_client):
    url = reverse("teams-list")
    data = {"name": "DevOps"}

    res1 = auth_client.post(url, data)
    assert res1.status_code == 201

    res2 = auth_client.post(url, data)
    assert res2.status_code == 400
    assert "name" in res2.data or "error" in res2.data
