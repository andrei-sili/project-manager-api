"""Regression tests for the authorization fixes (cross-tenant access, pending
members/admins, unauthenticated file download, SVG upload, task reassignment)."""
import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.teams.models import TeamMembership
from tests.factories import (
    UserFactory, TeamFactory, ProjectFactory, TaskFactory,
    TaskFileFactory, ActivityLogFactory,
)


# --- Activity log: no cross-tenant leak -------------------------------------

@pytest.mark.django_db
def test_user_cannot_read_other_teams_activity_log(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    TeamFactory(members=[user])  # user belongs to their own team

    other_project = ProjectFactory()  # different team the user is not in
    ActivityLogFactory(project=other_project)

    # Even explicitly asking for the other team's project must return nothing.
    url = reverse("logs-list") + f"?project={other_project.id}"
    res = api_client.get(url)
    assert res.status_code == 200
    assert res.data["count"] == 0


# --- Task file download: authenticated + team-scoped ------------------------

@pytest.mark.django_db
def test_file_download_requires_authentication(api_client):
    file = TaskFileFactory()
    url = reverse("download_task_file", args=[file.task.project.id, file.task.id, file.id])
    res = api_client.get(url)
    assert res.status_code == 401


@pytest.mark.django_db
def test_non_member_cannot_download_file(api_client):
    file = TaskFileFactory()
    api_client.force_authenticate(user=UserFactory())  # not on the file's team
    url = reverse("download_task_file", args=[file.task.project.id, file.task.id, file.id])
    res = api_client.get(url)
    assert res.status_code == 403


@pytest.mark.django_db
def test_member_can_download_file(api_client):
    user = UserFactory()
    team = TeamFactory(members=[user])
    task = TaskFactory(project=ProjectFactory(team=team))
    file = TaskFileFactory(task=task)
    api_client.force_authenticate(user=user)

    url = reverse("download_task_file", args=[task.project.id, task.id, file.id])
    res = api_client.get(url)
    assert res.status_code == 200
    assert res["X-Content-Type-Options"] == "nosniff"


# --- SVG upload rejected (stored-XSS vector) --------------------------------

@pytest.mark.django_db
def test_svg_upload_is_rejected(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory(members=[user])
    task = TaskFactory(project=ProjectFactory(team=team))

    svg = SimpleUploadedFile(
        "x.svg", b"<svg><script>alert(1)</script></svg>", content_type="image/svg+xml"
    )
    url = reverse("task-files-list", args=[task.project.id, task.id])
    res = auth_client.post(url, {"file": svg}, format="multipart")
    assert res.status_code == 400


# --- Pending members/admins have no access ----------------------------------

@pytest.mark.django_db
def test_pending_member_cannot_list_team_projects(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="pending")
    ProjectFactory(team=team)
    api_client.force_authenticate(user=user)

    res = api_client.get(reverse("projects-list"))
    assert res.status_code == 200
    assert res.data["count"] == 0


@pytest.mark.django_db
def test_pending_admin_cannot_invite_members(api_client):
    admin = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=admin, role="admin", status="pending")
    api_client.force_authenticate(user=admin)

    url = reverse("teams-invite-member", args=[team.id])
    res = api_client.post(url, {"email": "new@example.com", "role": "developer"})
    assert res.status_code == 403


# --- Task reassignment must stay within the team ----------------------------

@pytest.mark.django_db
def test_cannot_reassign_task_to_non_member_on_update(api_client):
    user = UserFactory()
    team = TeamFactory(members=[user])
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, created_by=user, assigned_to=user)
    outsider = UserFactory()
    api_client.force_authenticate(user=user)

    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = api_client.patch(url, {"assigned_to": outsider.id})
    assert res.status_code == 403
