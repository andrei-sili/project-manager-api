import pytest
from django.urls import reverse
from rest_framework import status
from tests.factories import UserFactory, TeamFactory, ProjectFactory
from apps.teams.models import TeamMembership
from apps.projects.models import Project


@pytest.mark.django_db
def test_create_project(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role='admin', status='accepted')
    url = reverse("projects-list")
    data = {"name": "Project X", "team": team.id}
    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["name"] == "Project X"


@pytest.mark.django_db
def test_create_project_unauthenticated(api_client):
    url = reverse("projects-list")
    res = api_client.post(url, {"name": "No Access", "team": 1})
    assert res.status_code == 401


@pytest.mark.django_db
def test_list_only_accessible_projects(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role='developer', status='accepted')
    accessible_project = ProjectFactory(team=team)

    other_team = TeamFactory()
    other_project = ProjectFactory(team=other_team)

    url = reverse("projects-list")
    res = auth_client.get(url)
    assert res.status_code == 200

    results = res.data["results"]
    assert any(p["id"] == accessible_project.id for p in results)
    assert all(p["id"] != other_project.id for p in results)



@pytest.mark.django_db
def test_update_project_by_non_admin_should_fail(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role='developer', status='accepted')
    project = ProjectFactory(team=team)
    api_client.force_authenticate(user=user)
    url = reverse("projects-detail", args=[project.id])
    res = api_client.patch(url, {"name": "Updated"})
    assert res.status_code == 403


@pytest.mark.django_db
def test_update_project_by_admin(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role='admin', status='accepted')
    project = ProjectFactory(team=team)
    url = reverse("projects-detail", args=[project.id])
    res = auth_client.patch(url, {"name": "Updated"})
    assert res.status_code == 200
    assert res.data["name"] == "Updated"


@pytest.mark.django_db
def test_delete_project_by_creator(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role='admin', status='accepted')
    project = ProjectFactory(team=team)
    url = reverse("projects-detail", args=[project.id])
    res = auth_client.delete(url)
    assert res.status_code == 204
    assert not Project.objects.filter(id=project.id).exists()


@pytest.mark.django_db
def test_delete_project_by_non_member_should_fail(api_client):
    project = ProjectFactory()
    outsider = UserFactory()
    api_client.force_authenticate(user=outsider)
    url = reverse("projects-detail", args=[project.id])
    res = api_client.delete(url)
    assert res.status_code == 404
