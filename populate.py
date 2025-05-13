import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project_manager_api.settings")
django.setup()

from users.models import CustomUser
from teams.models import Team, TeamMembership


TeamMembership.objects.all().delete()
Team.objects.all().delete()


user_data = [
    {'email': 'alice@example.com', 'first_name': 'Alice', 'last_name': 'Doe'},
    {'email': 'bob@example.com', 'first_name': 'Bob', 'last_name': 'Smith'},
    {'email': 'carol@example.com', 'first_name': 'Carol', 'last_name': 'Jones'},
]

created_users = []

for data in user_data:
    user, created = CustomUser.objects.get_or_create(
        email=data['email'],
        defaults={
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'password': '12345678'
        }
    )
    if created:
        user.set_password('12345678')
        user.save()
    created_users.append(user)


team1 = Team.objects.create(name="Dev Team", created_by=created_users[0])
TeamMembership.objects.create(team=team1, user=created_users[0], role='admin')
TeamMembership.objects.create(team=team1, user=created_users[1], role='developer')
TeamMembership.objects.create(team=team1, user=created_users[2], role='manager')

team2 = Team.objects.create(name="QA Team", created_by=created_users[1])
TeamMembership.objects.create(team=team2, user=created_users[1], role='admin')
TeamMembership.objects.create(team=team2, user=created_users[2], role='developer')

print("Successful populated db")
