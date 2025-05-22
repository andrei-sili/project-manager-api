import pytest
from django.urls import reverse

from apps.logs.services import log_activity
from tests.factories import (
    UserFactory, TeamFactory, ProjectFactory, TaskFactory, ActivityLogFactory
)
from apps.teams.models import TeamMembership
from apps.logs.models import ActivityLog


@pytest.mark.django_db
def test_list_logs_for_project(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    ActivityLogFactory(project=project, action="created")
    ActivityLogFactory(project=project, action="updated")
    url = reverse("logs-list") + f"?project={project.id}"

    res = auth_client.get(url)
    assert res.status_code == 200
    assert res.data["count"] >= 2
    assert all(log["project"] == project.id for log in res.data["results"])


@pytest.mark.django_db
def test_logs_are_filtered_to_team_member(auth_client):
    user = auth_client.handler._force_user
    team1 = TeamFactory()
    team2 = TeamFactory()
    TeamMembership.objects.create(team=team1, user=user, role="developer", status="accepted")
    project1 = ProjectFactory(team=team1)
    project2 = ProjectFactory(team=team2)
    ActivityLogFactory(project=project1, action="create")
    ActivityLogFactory(project=project2, action="delete")
    url = reverse("logs-list") + f"?project={project1.id}"

    res = auth_client.get(url)
    assert res.status_code == 200
    assert all(log["project"] == project1.id for log in res.data["results"])


@pytest.mark.django_db
def test_anonymous_user_cannot_access_logs(api_client):
    url = reverse("logs-list")
    res = api_client.get(url)
    assert res.status_code == 401


@pytest.mark.django_db
def test_log_entry_content(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    log = ActivityLogFactory(project=project, user=user, action="commented", target_type="comment", target_id=123)
    url = reverse("logs-list") + f"?project={project.id}"

    res = auth_client.get(url)
    assert res.status_code == 200
    entry = res.data["results"][0]
    assert entry["user"]["id"] == user.id
    assert entry["action"] == "commented"
    assert entry["target_type"] == "comment"
    assert entry["target_id"] == 123



@pytest.mark.django_db
def test_filter_logs_by_project(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project1 = ProjectFactory(team=team)
    project2 = ProjectFactory(team=team)
    log_activity(user, "viewed", "task", 1, "Task 1", project1)
    log_activity(user, "viewed", "task", 2, "Task 2", project2)

    url = reverse("logs-list") + f"?project={project1.id}"
    res = auth_client.get(url)
    assert res.status_code == 200
    assert all(log["target_repr"] == "Task 1" for log in res.data["results"])

@pytest.mark.django_db
def test_filter_logs_by_user(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    log_activity(user, "viewed", "task", 1, "Task 1", project)

    other_user = UserFactory()
    log_activity(other_user, "viewed", "task", 2, "Task 2", project)

    url = reverse("logs-list") + f"?user={user.id}"
    res = auth_client.get(url)
    assert res.status_code == 200
    assert all(log["user"]["id"] == user.id for log in res.data["results"])

@pytest.mark.django_db
def test_log_activity_creates_log():
    user = UserFactory()
    project = ProjectFactory()
    log_activity(user, "deleted", "task", 3, "Task 3", project)
    log = ActivityLog.objects.last()
    assert log.user == user
    assert log.project == project
    assert log.action == "deleted"
    assert log.target_type == "task"
    assert log.target_repr == "Task 3"

@pytest.mark.django_db
def test_log_activity_missing_required_fields():
    user = UserFactory()
    with pytest.raises(TypeError):
        log_activity(user=user, action="created", target_type="task", target_id=1)

@pytest.mark.django_db
def test_logs_are_ordered_by_timestamp(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    log_activity(user, "edited", "task", 1, "T1", project)
    log_activity(user, "commented", "task", 2, "T2", project)
    url = reverse("logs-list")
    res = auth_client.get(url)
    timestamps = [log["timestamp"] for log in res.data["results"]]
    assert timestamps == sorted(timestamps, reverse=True)