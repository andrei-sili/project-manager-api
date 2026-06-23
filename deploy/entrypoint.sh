#!/bin/sh
set -e

# Runs as root only to make the mounted volumes writable by the non-root app
# user (handles pre-existing root-owned volumes), then drops to appuser for
# everything else.
chown -R appuser /app/media /app/static 2>/dev/null || true

gosu appuser python manage.py migrate --noinput
gosu appuser python manage.py collectstatic --noinput

exec gosu appuser daphne -b 0.0.0.0 -p 8000 config.asgi:application
