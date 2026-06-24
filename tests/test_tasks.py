from datetime import timedelta
from unittest.mock import patch

import pytest
from django.urls import reverse
from django.utils import timezone

from tests.factories import UserFactory, TeamFactory, ProjectFactory, TaskFactory
from apps.teams.models import TeamMembership
from apps.tasks.models import Task


@pytest.mark.django_db
def test_create_task(auth_client):
    team = TeamFactory()
    assignee = UserFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="manager", status="accepted")
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
        "due_date": timezone.now().date() + timedelta(days=30)
    }

    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["title"] == "Testaufgabe"


@pytest.mark.django_db
def test_assignee_notified_once_on_task_create(auth_client):
    from apps.notify.models import Notification
    team = TeamFactory()
    assignee = UserFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="manager", status="accepted")
    TeamMembership.objects.create(team=team, user=assignee, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "T", "description": "d", "project": project.id,
        "assigned_to": assignee.id, "status": "todo", "priority": "medium",
        "due_date": timezone.now().date() + timedelta(days=10),
    }
    res = auth_client.post(url, data)
    assert res.status_code == 201
    # Assignee is notified individually and is also a team member, but must not
    # also receive the team-wide notification → exactly one.
    assert Notification.objects.filter(user=assignee).count() == 1


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
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    url = reverse("project-tasks-list", args=[project.id])
    data = {
        "title": "Unassigned Task",
        "description": "No assignee",
        "project": project.id,
        "status": "todo",
        "priority": "low",
        "due_date": timezone.now().date() + timedelta(days=30)
    }
    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["assigned_to"] is None


@patch("apps.tasks.views.notify_user")
@pytest.mark.django_db
def test_notify_called_if_creator_not_assignee(mock_notify, auth_client):
    team = TeamFactory()
    creator = auth_client.handler._force_user
    assignee = UserFactory()
    TeamMembership.objects.create(team=team, user=creator, role="manager", status="accepted")
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
    assert res.status_code == 201
    mock_notify.assert_called_once()


@pytest.mark.django_db
def test_developer_can_move_assigned_task_status(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, assigned_to=user, status="todo")
    api_client.force_authenticate(user=user)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = api_client.patch(url, {"status": "in_progress"})
    assert res.status_code == 200
    task.refresh_from_db()
    assert task.status == "in_progress"


@pytest.mark.django_db
def test_developer_cannot_create_task(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    api_client.force_authenticate(user=user)
    url = reverse("project-tasks-list", args=[project.id])
    res = api_client.post(url, {
        "title": "Dev task", "description": "x", "project": project.id,
        "status": "todo", "priority": "low",
        "due_date": timezone.now().date() + timedelta(days=5),
    })
    assert res.status_code == 403


@pytest.mark.django_db
def test_developer_cannot_delete_task(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, assigned_to=user)
    api_client.force_authenticate(user=user)
    res = api_client.delete(reverse("project-tasks-detail", args=[project.id, task.id]))
    assert res.status_code == 403


@pytest.mark.django_db
def test_developer_cannot_edit_non_status_fields(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project, assigned_to=user, description="original")
    api_client.force_authenticate(user=user)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = api_client.patch(url, {"description": "hacked"})
    assert res.status_code == 200  # status-only serializer ignores other fields
    task.refresh_from_db()
    assert task.description == "original"


@pytest.mark.django_db
def test_manager_can_create_and_delete_task(api_client):
    user = UserFactory()
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    api_client.force_authenticate(user=user)
    create = api_client.post(reverse("project-tasks-list", args=[project.id]), {
        "title": "Mgr task", "description": "x", "project": project.id,
        "status": "todo", "priority": "low",
        "due_date": timezone.now().date() + timedelta(days=5),
    })
    assert create.status_code == 201
    task_id = Task.objects.get(title="Mgr task").id
    delete = api_client.delete(reverse("project-tasks-detail", args=[project.id, task_id]))
    assert delete.status_code == 204


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
    assert res.status_code == 400
    assert "due_date" in res.data


@pytest.mark.django_db
def test_update_overdue_task_is_allowed(auth_client):
    # Editing a task that is already past its due date must not be blocked.
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    past = timezone.now() - timedelta(days=5)
    task = TaskFactory(project=project, due_date=past)
    url = reverse("project-tasks-detail", args=[project.id, task.id])
    res = auth_client.patch(url, {"title": "Edited", "due_date": past.date().isoformat()})
    assert res.status_code == 200
    assert res.data["title"] == "Edited"


@pytest.mark.django_db
def test_my_tasks_returns_only_own_tasks(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory(members=[user])
    project = ProjectFactory(team=team)
    mine_created = TaskFactory(project=project, created_by=user, assigned_to=None)
    mine_assigned = TaskFactory(project=project, created_by=UserFactory(), assigned_to=user)
    TaskFactory(project=project, created_by=UserFactory(), assigned_to=UserFactory())

    res = auth_client.get(reverse("my-tasks-list"))
    assert res.status_code == 200
    ids = {t["id"] for t in res.data["results"]}
    assert ids == {mine_created.id, mine_assigned.id}
