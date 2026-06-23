from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Stricter per-IP throttle for unauthenticated auth endpoints
    (login, password reset) to slow down brute-force attempts."""

    scope = "auth"


class RegisterRateThrottle(AnonRateThrottle):
    """Tight per-IP cap on registration, which emails a verification link to an
    arbitrary address — limits email-bombing / Resend quota abuse."""

    scope = "register"


class InviteRateThrottle(UserRateThrottle):
    """Per-user cap on team invitations (each one sends an email)."""

    scope = "invite"
