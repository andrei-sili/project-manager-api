import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from apps.notify.middleware import JwtAuthMiddleware

import apps.notify.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project-manager-api.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddleware(
        URLRouter(
            apps.notify.routing.websocket_urlpatterns
        )
    ),
})
