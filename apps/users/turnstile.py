"""Cloudflare Turnstile verification for the registration endpoint.

A no-op unless ``TURNSTILE_SECRET_KEY`` is configured, so local development and
the test suite run without a CAPTCHA. Uses the standard library only.
"""
import json
import logging
from urllib import error, parse, request

from django.conf import settings
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
_ERROR = {"turnstile": "CAPTCHA verification failed. Please try again."}


def verify_turnstile(token, remoteip=None):
    """Validate a Turnstile token, raising ``ValidationError`` on failure.

    Returns immediately when no secret key is set (feature disabled).
    """
    secret = getattr(settings, "TURNSTILE_SECRET_KEY", "")
    if not secret:
        return
    if not token:
        raise ValidationError(_ERROR)

    fields = {"secret": secret, "response": token}
    if remoteip:
        fields["remoteip"] = remoteip
    payload = parse.urlencode(fields).encode()

    try:
        with request.urlopen(VERIFY_URL, data=payload, timeout=5) as resp:
            result = json.loads(resp.read().decode())
    except (error.URLError, ValueError) as exc:
        logger.warning("Turnstile verification request failed: %s", exc)
        raise ValidationError(_ERROR)

    if not result.get("success"):
        logger.info("Turnstile rejected a registration: %s", result.get("error-codes"))
        raise ValidationError(_ERROR)
