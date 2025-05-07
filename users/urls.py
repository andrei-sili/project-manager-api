from django.urls import path, include
from rest_framework import routers
from users import views

user_router = routers.SimpleRouter()
user_router.register('', views.UserViewSet, basename='user-profile')

urlpatterns = [
    path('', include(user_router.urls)),
]