import factory
from factory.django import DjangoModelFactory
from django.utils import timezone

# Import modele
from apps.users.models import CustomUser
from apps.teams.models import Team, TeamMembership
from apps.projects.models import Project
from apps.tasks.models import Task
from apps.comments.models import Comment
from apps.taskfiles.models import TaskFile
from apps.notify.models import Notification
from apps.logs.models import ActivityLog


# -------- USERS --------
class UserFactory(DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True
    password = factory.PostGenerationMethodCall("set_password", "password123A!")


# -------- TEAMS --------
class TeamFactory(DjangoModelFactory):
    class Meta:
        model = Team
        skip_postgeneration_save = True

    name = factory.Sequence(lambda n: f"Team {n}")
    created_by = factory.SubFactory(UserFactory)

    @factory.post_generation
    def members(self, create, extracted, **kwargs):
        if create and extracted:
            for user in extracted:
                TeamMembership.objects.create(
                    team=self,
                    user=user,
                    role="developer",
                    status="accepted"
                )


class TeamMembershipFactory(DjangoModelFactory):
    class Meta:
        model = TeamMembership

    team = factory.SubFactory(TeamFactory)
    user = factory.SubFactory(UserFactory)
    role = "developer"
    status = "accepted"


# -------- PROJECTS --------
class ProjectFactory(DjangoModelFactory):
    class Meta:
        model = Project

    name = factory.Sequence(lambda n: f"Project {n}")
    description = factory.Faker("sentence")
    team = factory.SubFactory(TeamFactory)
    created_by = factory.SelfAttribute("team.created_by")


# -------- TASKS --------
class TaskFactory(DjangoModelFactory):
    class Meta:
        model = Task

    title = factory.Sequence(lambda n: f"Task {n}")
    description = factory.Faker("sentence")
    status = "todo"
    priority = "medium"
    due_date = factory.LazyFunction(lambda: timezone.now() + timezone.timedelta(days=5))
    project = factory.SubFactory(ProjectFactory)
    created_by = factory.SelfAttribute("project.created_by")
    assigned_to = factory.SelfAttribute("project.created_by")


# -------- COMMENTS --------
class CommentFactory(DjangoModelFactory):
    class Meta:
        model = Comment

    task = factory.SubFactory(TaskFactory)
    user = factory.SelfAttribute("task.created_by")
    text = factory.Faker("paragraph")
    created_at = factory.LazyFunction(timezone.now)
    parent = None


# -------- TASKFILES --------
class TaskFileFactory(DjangoModelFactory):
    class Meta:
        model = TaskFile

    task = factory.SubFactory(TaskFactory)
    uploaded_by = factory.SelfAttribute("task.created_by")
    file = factory.django.FileField(filename="example.txt")
    uploaded_at = factory.LazyFunction(timezone.now)


# -------- NOTIFICATIONS --------
class NotificationFactory(DjangoModelFactory):
    class Meta:
        model = Notification

    user = factory.SubFactory(UserFactory)
    message = factory.Faker("sentence")
    is_read = False
    type = "task"
    created_at = factory.LazyFunction(timezone.now)


# -------- LOGS --------
class ActivityLogFactory(DjangoModelFactory):
    class Meta:
        model = ActivityLog

    user = factory.SubFactory(UserFactory)
    action = "created"
    target_type = "task"
    target_id = 1
    target_repr = "Task: Example"
    project = factory.SubFactory(ProjectFactory)
    timestamp = factory.LazyFunction(timezone.now)
