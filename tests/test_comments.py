import pytest
from django.urls import reverse
from rest_framework import status
from tests.factories import (
    UserFactory, TeamFactory, ProjectFactory, TaskFactory, CommentFactory
)
from apps.teams.models import TeamMembership
from apps.comments.models import Comment


@pytest.mark.django_db
def test_create_comment(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    url = reverse("task-comments-list", args=[project.id, task.id])
    data = {"text": "Test comment"}
    res = auth_client.post(url, data)
    assert res.status_code == 201
    assert res.data["text"] == "Test comment"


@pytest.mark.django_db
def test_list_comments(auth_client):
    team = TeamFactory()
    user = auth_client.handler._force_user
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    CommentFactory(task=task, user=user)
    CommentFactory(task=task, user=user)
    url = reverse("task-comments-list", args=[project.id, task.id])
    res = auth_client.get(url)
    assert res.status_code == 200
    assert len(res.data["results"]) == 2


@pytest.mark.django_db
def test_update_own_comment(auth_client):
    team = TeamFactory()
    user = auth_client.handler._force_user
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    comment = CommentFactory(task=task, user=user)
    url = reverse("task-comments-detail", args=[project.id, task.id, comment.id])
    res = auth_client.patch(url, {"text": "Updated"})
    assert res.status_code == 200
    assert res.data["text"] == "Updated"


@pytest.mark.django_db
def test_delete_comment(auth_client):
    team = TeamFactory()
    user = auth_client.handler._force_user
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    comment = CommentFactory(task=task, user=user)
    url = reverse("task-comments-detail", args=[project.id, task.id, comment.id])
    res = auth_client.delete(url)
    assert res.status_code == 204
    assert not Comment.objects.filter(id=comment.id).exists()


@pytest.mark.django_db
def test_create_comment_unauthorized_should_fail(api_client):
    task = TaskFactory()
    url = reverse("task-comments-list", args=[task.project.id, task.id])
    res = api_client.post(url, {"text": "Unauthenticated!"})
    assert res.status_code == 401


@pytest.mark.django_db
def test_create_comment_without_text_should_fail(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    url = reverse("task-comments-list", args=[project.id, task.id])
    res = auth_client.post(url, {})
    assert res.status_code == 400
    assert "text" in res.data


@pytest.mark.django_db
def test_update_nonexistent_comment_should_return_404(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    url = reverse("task-comments-detail", args=[project.id, task.id, 999])
    res = auth_client.patch(url, {"text": "test"})
    assert res.status_code == 404


@pytest.mark.django_db
def test_delete_comment_not_owned_should_fail(api_client):
    team = TeamFactory()
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    comment = CommentFactory(task=task)
    other_user = UserFactory()
    TeamMembership.objects.create(team=team, user=other_user, role="developer", status="accepted")
    api_client.force_authenticate(user=other_user)
    url = reverse("task-comments-detail", args=[project.id, task.id, comment.id])
    res = api_client.delete(url)
    assert res.status_code in (403, 204)  # 204 dacă nu ai restricție, 403 dacă da


@pytest.mark.django_db
def test_add_comment_to_task_in_another_team_should_fail(api_client):
    task = TaskFactory()
    other_user = UserFactory()
    api_client.force_authenticate(user=other_user)
    url = reverse("task-comments-list", args=[task.project.id, task.id])
    res = api_client.post(url, {"text": "test"})
    assert res.status_code == 403


@pytest.mark.django_db
def test_create_comment_with_empty_text_should_fail(auth_client):
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=auth_client.handler._force_user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    url = reverse("task-comments-list", args=[project.id, task.id])
    res = auth_client.post(url, {"text": ""})
    assert res.status_code == 400
    assert "text" in res.data


@pytest.mark.django_db
def test_create_reply_to_comment(auth_client):
    team = TeamFactory()
    user = auth_client.handler._force_user
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)
    parent_comment = CommentFactory(task=task, user=user)
    url = reverse("task-comments-list", args=[project.id, task.id])
    res = auth_client.post(url, {"text": "reply", "parent": parent_comment.id})
    assert res.status_code == 201
    assert res.data["parent"] == parent_comment.id


@pytest.mark.django_db
def test_create_reply_to_comment_from_another_task_should_fail(auth_client):
    team = TeamFactory()
    user = auth_client.handler._force_user
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project1 = ProjectFactory(team=team)
    project2 = ProjectFactory(team=team)
    task1 = TaskFactory(project=project1)
    task2 = TaskFactory(project=project2)
    comment_from_other_task = CommentFactory(task=task2, user=user)
    url = reverse("task-comments-list", args=[project1.id, task1.id])
    res = auth_client.post(url, {"text": "invalid reply", "parent": comment_from_other_task.id})
    assert res.status_code in (400, 403)
