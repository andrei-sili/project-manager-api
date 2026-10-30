# Backend image: Django + DRF + Channels, served over ASGI by Daphne.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# gosu lets the entrypoint drop from root to the app user after fixing volume perms.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# The base image ships without .pyc files and PYTHONDONTWRITEBYTECODE stops them
# being cached, so every short-lived python process (healthcheck, cron management
# commands) recompiled the stdlib: ~1s idle on a small VM, past the healthcheck
# timeout under load. Precompile stdlib and dependencies once at build time.
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m compileall -q /usr/local/lib/python3.12

COPY . .

# Non-root app user; own the code and the static/media dirs.
RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /app/media /app/static \
    && chown -R appuser /app

EXPOSE 8000

# Liveness check used by docker-compose / orchestrators (public endpoint).
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health/').status==200 else 1)"

# Entrypoint fixes volume ownership as root, then runs migrate/collectstatic/daphne as appuser.
ENTRYPOINT ["sh", "/app/deploy/entrypoint.sh"]
