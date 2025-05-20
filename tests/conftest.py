import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    from tests.factories import UserFactory
    return UserFactory()

@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.fixture
def team(db, user):
    from tests.factories import TeamFactory
    from apps.teams.models import TeamMembership
    team = TeamFactory(created_by=user)
    TeamMembership.objects.create(team=team, user=user, role='admin', status='accepted')
    return team

@pytest.fixture
def project(team):
    from tests.factories import ProjectFactory
    return ProjectFactory(team=team, created_by=team.created_by)

@pytest.fixture
def task(project):
    from tests.factories import TaskFactory
    return TaskFactory(project=project, created_by=project.created_by)
