"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_nested import routers

from apps.comments.views import CommentViewSet
from apps.logs.views import ActivityLogViewSet

from apps.notify.views import NotificationViewSet
from apps.projects.views import ProjectViewSet
from apps.taskfiles.views import TaskFileViewSet
from apps.tasks.views import TaskViewSet, MyTaskViewSet
from apps.teams.views import TeamViewSet

from apps.users.views import RequestPasswordResetView, ConfirmPasswordResetView

#  JWT Auth
auth_urlpatterns = [
    path('api/token_obtain_pair/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

#  Reset password
request_confirm_pass_urlpatterns = [
    path('api/token/', RequestPasswordResetView.as_view(), name='request-reset-password'),
    path('api/confirm-reset-password/', ConfirmPasswordResetView.as_view(), name='confirm-reset-password'),
]

#  Routers
router = routers.SimpleRouter()
router.register('projects', ProjectViewSet, basename='projects')

projects_router = routers.NestedSimpleRouter(router, 'projects', lookup='project')
projects_router.register('tasks', TaskViewSet, basename='project-tasks')

tasks_router = routers.NestedSimpleRouter(projects_router, r'tasks', lookup='task')
tasks_router.register('comments', CommentViewSet, basename='task-comments')
tasks_router.register('files', TaskFileViewSet, basename='task-files')
router.register('notifications', NotificationViewSet, basename='notifications')
router.register('logs', ActivityLogViewSet, basename='logs')
router.register('teams', TeamViewSet, basename='teams')
router.register("my-tasks", MyTaskViewSet, basename="my-tasks")

#  Final urlpatterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include(projects_router.urls)),
    path('api/', include('apps.users.urls')),
    path('api/', include(tasks_router.urls)),
] + auth_urlpatterns + request_confirm_pass_urlpatterns


