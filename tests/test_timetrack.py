from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from apps.timetrack.models import TimeEntry
from tests.factories import UserFactory, TeamFactory, ProjectFactory, TaskFactory


def _member_task(user):
    """A task on a team the user is an accepted member of."""
    team = TeamFactory(members=[user])
    return TaskFactory(project=ProjectFactory(team=team))


@pytest.mark.django_db
def test_create_time_entry(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    res = auth_client.post(
        reverse("timeentry-list"),
        {"task_id": task.id, "minutes": 30, "date": str(timezone.now().date())},
    )
    assert res.status_code == 201
    assert TimeEntry.objects.filter(user=user, task=task, minutes=30).exists()


@pytest.mark.django_db
def test_minutes_must_be_positive(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    res = auth_client.post(
        reverse("timeentry-list"),
        {"task_id": task.id, "minutes": 0, "date": str(timezone.now().date())},
    )
    assert res.status_code == 400
    assert "minutes" in res.data


@pytest.mark.django_db
def test_cannot_log_time_on_foreign_task(auth_client):
    user = auth_client.handler._force_user
    TeamFactory(members=[user])  # user's own (unrelated) team
    foreign_task = TaskFactory()  # task on a team the user is not in
    res = auth_client.post(
        reverse("timeentry-list"),
        {"task_id": foreign_task.id, "minutes": 15, "date": str(timezone.now().date())},
    )
    assert res.status_code == 400


@pytest.mark.django_db
def test_list_shows_only_own_entries(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    TimeEntry.objects.create(user=user, task=task, minutes=10, date=timezone.now().date())
    TimeEntry.objects.create(user=UserFactory(), task=task, minutes=99, date=timezone.now().date())

    res = auth_client.get(reverse("timeentry-list"))
    assert res.status_code == 200
    assert res.data["count"] == 1
    assert res.data["results"][0]["minutes"] == 10


@pytest.mark.django_db
def test_update_time_entry(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    entry = TimeEntry.objects.create(user=user, task=task, minutes=10, date=timezone.now().date())
    res = auth_client.patch(reverse("timeentry-detail", args=[entry.id]), {"minutes": 45})
    assert res.status_code == 200
    entry.refresh_from_db()
    assert entry.minutes == 45


@pytest.mark.django_db
def test_delete_time_entry(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    entry = TimeEntry.objects.create(user=user, task=task, minutes=10, date=timezone.now().date())
    res = auth_client.delete(reverse("timeentry-detail", args=[entry.id]))
    assert res.status_code == 204
    assert not TimeEntry.objects.filter(id=entry.id).exists()


@pytest.mark.django_db
def test_summary_aggregates_minutes(auth_client):
    user = auth_client.handler._force_user
    task = _member_task(user)
    today = timezone.now().date()
    TimeEntry.objects.create(user=user, task=task, minutes=30, date=today)
    TimeEntry.objects.create(user=user, task=task, minutes=20, date=today)
    TimeEntry.objects.create(user=user, task=task, minutes=15, date=today - timedelta(days=2))

    res = auth_client.get(reverse("timeentry-summary"))
    assert res.status_code == 200
    assert res.data["total_minutes"] == 65
    assert res.data["today_minutes"] == 50
    assert len(res.data["per_day"]) == 7
    assert res.data["per_day"][-1]["minutes"] == 50  # today is the last bucket
