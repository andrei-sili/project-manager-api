"""
Django settings for the project-manager-api project.

Configuration is environment-driven: copy `.env.example` to `.env` and fill it in.
Deployment checklist: https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
"""
import os
import sys
from datetime import timedelta
from pathlib import Path

from corsheaders.defaults import default_headers
from dotenv import load_dotenv

load_dotenv()

# True while the test suite runs (used to relax throttling during tests).
TESTING = "pytest" in sys.modules

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def env_list(name, default=""):
    """Parse a comma-separated environment variable into a list of trimmed values."""
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


# --- Environment ------------------------------------------------------------
# ENVIRONMENT is either "development" or "production".
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = ENVIRONMENT == "development"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-dev-only-key-change-me"
    else:
        raise RuntimeError("SECRET_KEY environment variable is required in production.")

# Comma-separated env vars; safe localhost defaults only in development.
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1" if DEBUG else "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# --- Applications -----------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3rd party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    'drf_spectacular',

    # local apps
    'apps.users',
    'apps.teams',
    'apps.tasks',
    'apps.projects',
    'apps.comments',
    'apps.taskfiles',
    'apps.notify',
    'apps.logs',
    'apps.timetrack',
]

AUTH_USER_MODEL = 'users.CustomUser'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# --- Database ---------------------------------------------------------------
# SQLite by default; PostgreSQL is wired from the environment in a later phase.
# PostgreSQL when DATABASE_HOST is set (production), otherwise SQLite for dev.
if os.getenv("DATABASE_HOST"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DATABASE_NAME", "projectmanager"),
            "USER": os.getenv("DATABASE_USER", "projectmanager"),
            "PASSWORD": os.getenv("DATABASE_PASSWORD", ""),
            "HOST": os.getenv("DATABASE_HOST"),
            "PORT": os.getenv("DATABASE_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --- Password validation ----------------------------------------------------
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- REST framework ---------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # Disabled while the test suite runs; enforced otherwise.
        'anon': None if TESTING else '40/min',
        'user': None if TESTING else '240/min',
        'auth': None if TESTING else '8/min',  # login / register / password reset
    },
}

# --- API schema (drf-spectacular) -------------------------------------------
SPECTACULAR_SETTINGS = {
    'TITLE': 'Project Manager API',
    'DESCRIPTION': 'Team collaboration platform: projects, tasks (Kanban), '
                   'time tracking, roles and real-time notifications.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# --- SimpleJWT --------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    # Rotation is enabled together with the frontend changes in a later phase.
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

# --- Channels ---------------------------------------------------------------
# Redis when REDIS_URL is set (required when running more than one process),
# otherwise an in-memory layer for local development and tests.
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {"hosts": [REDIS_URL]},
        }
    }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }

# --- CORS / CSRF ------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:3000" if DEBUG else "")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + ["authorization", "content-type"]

# --- Internationalization ---------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- Static files & media ---------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files are served by WhiteNoise; compress + hash them in production.
if not DEBUG:
    STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }

# --- Email ------------------------------------------------------------------
# Console backend by default; set EMAIL_BACKEND + SMTP vars in production.
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@projectmanager.local")

# --- Production security hardening ------------------------------------------
# Only enforced when DEBUG is off, so local development stays on plain HTTP.
if not DEBUG:
    # Can be turned off (e.g. local docker-compose over plain HTTP) via env.
    SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "true").lower() == "true"
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31_536_000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# --- Logging ----------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{levelname} {asctime} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django.request": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}
