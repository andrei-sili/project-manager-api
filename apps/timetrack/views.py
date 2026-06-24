# timetrack/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import TimeEntry
from .serializers import TimeEntrySerializer
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta


class TimeEntryViewSet(viewsets.ModelViewSet):
    """The current user's time entries, filterable by date/task/project, plus a weekly summary."""

    queryset = TimeEntry.objects.none()  # actual rows come from get_queryset; set for schema generation
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = TimeEntry.objects.filter(user=self.request.user)

        # Filtering by date range (optional)
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])

        # Filtering by task or project (optional)
        task_id = self.request.query_params.get("task")
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(task__project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.get_queryset()
        total_minutes = queryset.aggregate(total=Sum('minutes'))['total'] or 0

        # Use the configured timezone so "today"/week match the UTC dates entries
        # are stored with (avoids attributing time to the wrong day near midnight).
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())

        # Breakdown for the last 7 days, aggregated in a single query.
        days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
        totals_by_date = {
            row['date']: row['minutes']
            for row in queryset.filter(date__gte=days[0])
            .values('date')
            .annotate(minutes=Sum('minutes'))
        }
        per_day = [
            {"date": str(day), "minutes": totals_by_date.get(day, 0)}
            for day in days
        ]

        today_minutes = totals_by_date.get(today, 0)
        week_total_minutes = queryset.filter(date__gte=week_start).aggregate(s=Sum('minutes'))['s'] or 0

        return Response({
            "total_minutes": total_minutes,
            "today_minutes": today_minutes,
            "week_total_minutes": week_total_minutes,
            "per_day": per_day
        })

