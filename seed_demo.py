"""
Rich demo seed for local testing: users, teams, projects, tasks, threaded
comments, time entries, notifications and activity logs.

Idempotent: clears existing collaboration data and recreates a fresh demo set
(users are kept / updated). Run with the virtualenv active:

    python seed_demo.py

Then log in at http://localhost:3000 with alice@example.com / 12345678
"""
import os
import random
from datetime import timedelta

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.utils import timezone

from apps.users.models import CustomUser
from apps.teams.models import Team, TeamMembership
from apps.projects.models import Project
from apps.tasks.models import Task
from apps.comments.models import Comment
from apps.timetrack.models import TimeEntry
from apps.notify.models import Notification
from apps.logs.models import ActivityLog

PASSWORD = "12345678"
random.seed(42)

# --- Clear previous demo content (users are kept and updated below) ---
ActivityLog.objects.all().delete()
Notification.objects.all().delete()
TimeEntry.objects.all().delete()
Comment.objects.all().delete()
Task.objects.all().delete()
Project.objects.all().delete()
TeamMembership.objects.all().delete()
Team.objects.all().delete()

# --- Users ---
people = [
    ("alice@example.com", "Alice", "Anderson"),
    ("bob@example.com", "Bob", "Brown"),
    ("carol@example.com", "Carol", "Clark"),
    ("dave@example.com", "Dave", "Davis"),
]
users = {}
for email, first, last in people:
    user, _ = CustomUser.objects.get_or_create(email=email)
    user.first_name, user.last_name = first, last
    user.set_password(PASSWORD)
    user.save()
    users[email] = user

alice = users["alice@example.com"]
bob = users["bob@example.com"]
carol = users["carol@example.com"]
dave = users["dave@example.com"]

# --- Teams ---
dev_team = Team.objects.create(name="Dev Team", created_by=alice)
TeamMembership.objects.create(team=dev_team, user=alice, role="admin", status="accepted")
TeamMembership.objects.create(team=dev_team, user=bob, role="developer", status="accepted")
TeamMembership.objects.create(team=dev_team, user=carol, role="manager", status="accepted")

design_team = Team.objects.create(name="Design Team", created_by=alice)
TeamMembership.objects.create(team=design_team, user=alice, role="admin", status="accepted")
TeamMembership.objects.create(team=design_team, user=dave, role="developer", status="accepted")

now = timezone.now()

# --- Projects ---
website = Project.objects.create(
    name="Website Redesign",
    description="Revamp the marketing website with a new design system.",
    team=dev_team, created_by=alice, budget=15000,
    due_date=(now + timedelta(days=45)).date(),
)
mobile = Project.objects.create(
    name="Mobile App MVP",
    description="Ship the first version of the iOS/Android app.",
    team=dev_team, created_by=carol, budget=42000,
    due_date=(now + timedelta(days=90)).date(),
)
brand = Project.objects.create(
    name="Brand Refresh",
    description="New logo, color palette and brand guidelines.",
    team=design_team, created_by=alice, budget=8000,
    due_date=(now + timedelta(days=30)).date(),
)

# --- Tasks: (project, title, description, status, priority, assignee) ---
task_specs = [
    (website, "Design new landing page", "Hero, features and pricing sections.", "in_progress", "high", alice),
    (website, "Set up CI pipeline", "GitHub Actions for tests and build.", "todo", "medium", bob),
    (website, "Write homepage copy", "Marketing copy, SEO-friendly.", "done", "low", carol),
    (website, "Accessibility audit", "WCAG AA review of key pages.", "todo", "medium", bob),
    (mobile, "Auth screens", "Login, register and password reset.", "in_progress", "high", bob),
    (mobile, "Push notifications", "Wire up FCM and APNs.", "todo", "high", carol),
    (mobile, "Onboarding flow", "Three-step intro carousel.", "todo", "low", alice),
    (brand, "Logo concepts", "Three directions to review.", "in_progress", "high", dave),
    (brand, "Color palette", "Primary, secondary and semantic colors.", "done", "medium", dave),
]
tasks = []
for project, title, desc, status, priority, assignee in task_specs:
    tasks.append(Task.objects.create(
        title=title, description=desc, project=project, assigned_to=assignee,
        status=status, priority=priority,
        due_date=now + timedelta(days=random.randint(3, 40)),
        created_by=project.created_by,
    ))

# --- Threaded comments ---
root = Comment.objects.create(task=tasks[0], user=bob, text="Looks great — can we tweak the hero spacing?")
Comment.objects.create(task=tasks[0], user=alice, text="Sure, pushing an update now.", parent=root)
Comment.objects.create(task=tasks[4], user=carol, text="Don't forget the 'remember me' option.")

# --- Time entries for the last 7 days ---
for user in (alice, bob, carol, dave):
    user_tasks = [t for t in tasks if t.assigned_to == user]
    if not user_tasks:
        continue
    for day_offset in range(7):
        day = (now - timedelta(days=day_offset)).date()
        for _ in range(random.randint(0, 2)):
            TimeEntry.objects.create(
                user=user, task=random.choice(user_tasks), date=day,
                minutes=random.choice([30, 45, 60, 90, 120]),
                note=random.choice(["Implementation", "Review", "Bugfix", "Pairing"]),
            )

# --- Notifications + activity log for alice ---
for message in [
    "New task assigned: Design new landing page",
    "Bob commented on your task",
    "Mobile App MVP deadline is approaching",
]:
    Notification.objects.create(user=alice, message=message, type="task")

for task in tasks[:5]:
    ActivityLog.objects.create(
        user=task.created_by, action="created", target_type="task",
        target_id=task.id, target_repr=f"Task: {task.title}", project=task.project,
    )

print("Demo data seeded:")
print(f"  users:    {CustomUser.objects.count()}")
print(f"  teams:    {Team.objects.count()}")
print(f"  projects: {Project.objects.count()}")
print(f"  tasks:    {Task.objects.count()}")
print(f"  comments: {Comment.objects.count()}")
print(f"  time:     {TimeEntry.objects.count()} entries")
print("Log in with  alice@example.com / 12345678")
