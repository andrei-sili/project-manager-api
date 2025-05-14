from django.urls import path
from rest_framework import routers
from users import views
from users.views import RegisterAndAcceptInviteView

router = routers.SimpleRouter()
router.register('users', views.UserViewSet, basename='user')


urlpatterns = router.urls

urlpatterns += [
    path('register-invite/', RegisterAndAcceptInviteView.as_view(), name='register_invite'),
]