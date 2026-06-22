import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize the Django ASGI application early to populate the app registry
# before importing code (consumers, middleware) that may import ORM models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import OriginValidator
from django.conf import settings

from apps.notify.middleware import JwtAuthMiddleware
import apps.notify.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # OriginValidator pins which browser origins may open a WebSocket. Defaults
    # to "*" for local dev/tests; in production set CHANNELS_ALLOWED_ORIGINS to
    # the frontend origin (it lives on a different host than the API).
    "websocket": OriginValidator(
        JwtAuthMiddleware(URLRouter(apps.notify.routing.websocket_urlpatterns)),
        settings.CHANNELS_ALLOWED_ORIGINS,
    ),
})
