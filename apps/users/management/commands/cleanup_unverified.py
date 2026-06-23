from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import CustomUser, EmailVerificationToken, PasswordResetToken


class Command(BaseCommand):
    help = "Delete unverified accounts older than N days and expired auth tokens."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days", type=int, default=3,
            help="Age (days) after which an unverified account is removed.",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        cutoff = now - timedelta(days=options["days"])

        # Unverified registrations stay is_active=False until they verify.
        stale_users = CustomUser.objects.filter(is_active=False, date_joined__lt=cutoff)
        n_users = stale_users.count()
        stale_users.delete()  # cascades to their tokens

        n_verify = EmailVerificationToken.objects.filter(
            created_at__lt=now - timedelta(hours=24)
        ).delete()[0]
        n_reset = PasswordResetToken.objects.filter(
            created_at__lt=now - timedelta(hours=1)
        ).delete()[0]

        self.stdout.write(self.style.SUCCESS(
            f"Removed {n_users} unverified accounts, "
            f"{n_verify} expired verification tokens, {n_reset} expired reset tokens."
        ))
