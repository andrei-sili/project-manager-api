import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize the Django ASGI application early to populate the app registry
# before importing code (consumers, middleware) that may import ORM models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter

from apps.notify.middleware import JwtAuthMiddleware
import apps.notify.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddleware(
        URLRouter(apps.notify.routing.websocket_urlpatterns)
    ),
})
