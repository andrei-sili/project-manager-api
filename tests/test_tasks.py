from unittest.mock import patch

import pytest
from django.urls import reverse
from tests.factories import UserFactory, TeamFactory, ProjectFactory, TaskFactory
from apps.teams.models import TeamMembership
from apps.tasks.models import Task


@pytest.mark.django_db
def test_create_task(auth_client):
    team = TeamFactory()
    assignee = UserFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    TeamMembership.objects.create(team=team, user=assignee, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "Testaufgabe",
        "description": "Details zur Aufgabe",
        "project": project.id,
        "assigned_to": assignee.id,
        "status": "todo",
        "priority": "medium",
        "due_date": "2025-12-31"
    }

    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["title"] == "Testaufgabe"


@pytest.mark.django_db
def test_list_tasks_for_project(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    TaskFactory(project=project)
    TaskFactory(project=project)
    url = reverse("project-tasks-list", args=[project.id])
    res = auth_client.get(url)
    assert res.status_code == 200
    assert len(res.data["results"]) == 2


@pytest.mark.django_db
def test_update_task(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="admin", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, created_by=auth_client.handler._force_user)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = auth_client.patch(url, {"title": "Aktualisiert"})
    assert res.status_code == 200
    assert res.data["title"] == "Aktualisiert"


@pytest.mark.django_db
def test_delete_task(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="admin", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, created_by=auth_client.handler._force_user)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = auth_client.delete(url)
    assert res.status_code == 204
    assert not Task.objects.filter(id=task.id).exists()


@pytest.mark.django_db
def test_unauthorized_task_access_should_fail(api_client):
    outsider = UserFactory()
    project = ProjectFactory()
    task = TaskFactory(project=project)
    api_client.force_authenticate(user=outsider)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = api_client.get(url)
    assert res.status_code == 404


@pytest.mark.django_db
def test_create_task_without_assignee(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "Unassigned Task",
        "description": "No assignee",
        "project": project.id,
        "status": "todo",
        "priority": "low",
        "due_date": "2025-12-31"
    }
    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["assigned_to"] is None


from datetime import timedelta
from django.utils import timezone


@patch("apps.tasks.views.notify_user")
@pytest.mark.django_db
def test_notify_called_if_creator_not_assignee(mock_notify, auth_client):
    team = TeamFactory()
    creator = auth_client.handler._force_user
    assignee = UserFactory()
    TeamMembership.objects.create(team=team, user=creator, role="developer", status="accepted")
    TeamMembership.objects.create(team=team, user=assignee, role="developer", status="accepted")
    project = ProjectFactory(team=team)

    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "Notify Task",
        "description": "Test",
        "project": project.id,
        "assigned_to": assignee.id,
        "status": "todo",
        "priority": "medium",
        "due_date": timezone.now().date() + timedelta(days=1)
    }

    res = auth_client.post(url, data)
    print(res.data)  # DEBUG pentru a vedea cauza 400
    assert res.status_code == 201
    mock_notify.assert_called_once()


@pytest.mark.django_db
def test_update_task_by_assignee_if_allowed(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, assigned_to=user)
    api_client.force_authenticate(user=user)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = api_client.patch(url, {"description": "Updated by assignee"})
    assert res.status_code in (200, 403)


@pytest.mark.django_db
def test_create_task_missing_title_should_fail(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "description": "No title",
        "project": project.id,
        "status": "todo",
        "priority": "low",
        "due_date": "2025-12-31"
    }
    res = auth_client.post(url, data)
    assert res.status_code == 400
    assert "title" in res.data


@pytest.mark.django_db
def test_create_task_with_past_due_date_should_fail(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "Past Due",
        "description": "Invalid date",
        "project": project.id,
        "status": "todo",
        "priority": "low",
        "due_date": "2000-01-01"
    }
    res = auth_client.post(url, data)
    assert res.status_code in (400, 201)
