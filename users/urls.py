from django.urls import path, include
from rest_framework import routers
from users import views

router = routers.SimpleRouter()
router.register('user', views.UserViewSet, basename='user')


urlpatterns = router.urls
