import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from tests.factories import (
    UserFactory, TeamFactory, TeamMembership, ProjectFactory, TaskFactory
)
from apps.taskfiles.models import TaskFile


@pytest.mark.django_db
def test_upload_file(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    url = reverse("task-files-list", args=[project.id, task.id])
    file = SimpleUploadedFile("test.txt", b"content")
    res = auth_client.post(url, {"file": file}, format="multipart")
    assert res.status_code == 201
    assert TaskFile.objects.filter(task=task).exists()


@pytest.mark.django_db
def test_file_size_validation(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    big_content = b"x" * (6 * 1024 * 1024)  # 6MB
    big_file = SimpleUploadedFile("bigfile.txt", big_content)

    url = reverse("task-files-list", args=[project.id, task.id])
    res = auth_client.post(url, {"file": big_file}, format="multipart")
    assert res.status_code == 400
    assert "file" in res.data


@pytest.mark.django_db
def test_file_list_and_metadata(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    file = SimpleUploadedFile("meta.txt", b"data")
    auth_client.post(reverse("task-files-list", args=[project.id, task.id]), {"file": file}, format="multipart")

    res = auth_client.get(reverse("task-files-list", args=[project.id, task.id]))
    assert res.status_code == 200
    assert res.data["count"] == 1
    assert "uploaded_by" in res.data["results"][0]
    assert "file_url" in res.data["results"][0]


@pytest.mark.django_db
def test_non_member_cannot_upload_file(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)
    project = ProjectFactory()
    task = TaskFactory(project=project)

    file = SimpleUploadedFile("hack.txt", b"hacking attempt")
    url = reverse("task-files-list", args=[project.id, task.id])
    res = api_client.post(url, {"file": file}, format="multipart")
    assert res.status_code == 403


@pytest.mark.django_db
def test_unauthenticated_user_cannot_access(api_client):
    project = ProjectFactory()
    task = TaskFactory(project=project)
    url = reverse("task-files-list", args=[project.id, task.id])
    res = api_client.get(url)
    assert res.status_code == 401


@pytest.mark.django_db
def test_upload_without_file_should_fail(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="manager", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    url = reverse("task-files-list", args=[project.id, task.id])
    res = auth_client.post(url, {})  # no file
    assert res.status_code == 400
    assert "file" in res.data


@pytest.mark.django_db
def test_upload_to_foreign_task_should_fail(auth_client):
    user = auth_client.handler._force_user
    other_team = TeamFactory()
    other_project = ProjectFactory(team=other_team)
    task = TaskFactory(project=other_project)

    file = SimpleUploadedFile("illegal.txt", b"fail")

    url = reverse("task-files-list", args=[other_project.id, task.id])
    res = auth_client.post(url, {"file": file}, format="multipart")
    assert res.status_code in (403, 404)


@pytest.mark.django_db
def test_duplicate_filename_upload_should_not_override(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    file = SimpleUploadedFile("same.txt", b"v1")
    auth_client.post(reverse("task-files-list", args=[project.id, task.id]), {"file": file}, format="multipart")

    file2 = SimpleUploadedFile("same.txt", b"v2")
    res = auth_client.post(reverse("task-files-list", args=[project.id, task.id]), {"file": file2}, format="multipart")

    assert res.status_code == 201
    assert TaskFile.objects.filter(task=task).count() == 2


@pytest.mark.django_db
def test_file_upload_accepts_various_types(auth_client):
    user = auth_client.handler._force_user
    team = TeamFactory()
    TeamMembership.objects.create(team=team, user=user, role="developer", status="accepted")
    project = ProjectFactory(team=team)
    task = TaskFactory(project=project)

    png = SimpleUploadedFile("img.png", b"\x89PNG...", content_type="image/png")
    pdf = SimpleUploadedFile("file.pdf", b"%PDF-1.4", content_type="application/pdf")
    res1 = auth_client.post(reverse("task-files-list", args=[project.id, task.id]), {"file": png}, format="multipart")
    res2 = auth_client.post(reverse("task-files-list", args=[project.id, task.id]), {"file": pdf}, format="multipart")

    assert res1.status_code == 201
    assert res2.status_code == 201