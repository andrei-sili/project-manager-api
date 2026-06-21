from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Stricter per-IP throttle for unauthenticated auth endpoints
    (login, register, password reset) to slow down brute-force attempts."""

    scope = "auth"
