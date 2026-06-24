import uuid

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
def test_change_role_on_pending_member_fails(auth_client):
    team = TeamFactory(created_by=auth_client.handler._force_user)
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="admin", status="accepted")
    member = UserFactory()
    TeamMembership.objects.create(team=team, user=member, role="developer", status="pending")
    url = reverse("teams-change-role", args=[team.id])
    res = auth_client.post(url, {"user_id": member.id, "role": "manager"})
    assert res.status_code == 400
    assert TeamMembership.objects.get(team=team, user=member).role == "developer"


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


@pytest.mark.django_db
def test_cannot_demote_last_admin(auth_client):
    admin = auth_client.handler._force_user
    team = TeamFactory(created_by=admin)
    TeamMembership.objects.create(team=team, user=admin, role="admin", status="accepted")

    url = reverse("teams-change-role", args=[team.id])
    res = auth_client.post(url, {"user_id": admin.id, "role": "developer"})

    assert res.status_code == 400
    assert TeamMembership.objects.get(team=team, user=admin).role == "admin"


@pytest.mark.django_db
def test_non_admin_cannot_delete_team(api_client):
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    TeamMembership.objects.create(team=team, user=admin, role="admin", status="accepted")
    dev = UserFactory()
    TeamMembership.objects.create(team=team, user=dev, role="developer", status="accepted")

    api_client.force_authenticate(user=dev)
    res = api_client.delete(reverse("teams-detail", args=[team.id]))
    assert res.status_code == 403


@pytest.mark.django_db
def test_invite_sets_token_and_inviter(auth_client):
    admin = auth_client.handler._force_user
    team = TeamFactory(created_by=admin)
    TeamMembership.objects.create(team=team, user=admin, role="admin", status="accepted")

    res = auth_client.post(
        reverse("teams-invite-member", args=[team.id]),
        {"email": "new@example.com", "role": "developer"},
    )
    assert res.status_code == 200
    m = TeamMembership.objects.get(team=team, user__email="new@example.com")
    assert m.invite_token is not None
    assert m.invited_by == admin
    assert m.status == "pending"


def _pending_invite(team, invited_by, invitee, role="developer"):
    return TeamMembership.objects.create(
        team=team, user=invitee, role=role, status="pending",
        invited_by=invited_by, invite_token=uuid.uuid4(),
    )


@pytest.mark.django_db
def test_invitation_detail(api_client):
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    m = _pending_invite(team, admin, UserFactory(), role="manager")

    res = api_client.get(reverse("invitation-detail", args=[m.invite_token]))
    assert res.status_code == 200
    assert res.data["team"] == team.name
    assert res.data["role"] == "manager"
    assert res.data["has_account"] is True


@pytest.mark.django_db
def test_invitation_accept_by_logged_in_user(api_client):
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    invitee = UserFactory()
    m = _pending_invite(team, admin, invitee)

    api_client.force_authenticate(user=invitee)
    res = api_client.post(reverse("invitation-accept", args=[m.invite_token]))
    assert res.status_code == 200
    m.refresh_from_db()
    assert m.status == "accepted"


@pytest.mark.django_db
def test_invitation_accept_wrong_account_denied(api_client):
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    m = _pending_invite(team, admin, UserFactory())

    api_client.force_authenticate(user=UserFactory())  # not the invitee
    res = api_client.post(reverse("invitation-accept", args=[m.invite_token]))
    assert res.status_code == 403


@pytest.mark.django_db
def test_invitation_decline_notifies_inviter(api_client):
    from apps.notify.models import Notification
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    m = _pending_invite(team, admin, UserFactory())

    res = api_client.post(reverse("invitation-decline", args=[m.invite_token]))
    assert res.status_code == 200
    m.refresh_from_db()
    assert m.status == "declined"
    assert Notification.objects.filter(user=admin, type="invite").exists()


@pytest.mark.django_db
def test_register_invite_by_token_activates_and_accepts(api_client):
    from apps.users.models import CustomUser
    admin = UserFactory()
    team = TeamFactory(created_by=admin)
    placeholder = CustomUser(email="invitee@example.com", first_name="", last_name="")
    placeholder.set_unusable_password()
    placeholder.save()
    m = _pending_invite(team, admin, placeholder)

    res = api_client.post(reverse("register_invite"), {
        "token": str(m.invite_token),
        "password": "newpass123A!",
        "first_name": "Inv",
        "last_name": "Ited",
    })
    assert res.status_code == 200
    assert "access" in res.data
    placeholder.refresh_from_db()
    assert placeholder.is_active is True
    assert placeholder.has_usable_password()
    m.refresh_from_db()
    assert m.status == "accepted"
