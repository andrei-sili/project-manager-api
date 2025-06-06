# timetrack/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import TimeEntry
from .serializers import TimeEntrySerializer
from django.db.models import Sum, Q
from datetime import datetime, timedelta


class TimeEntryViewSet(viewsets.ModelViewSet):
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

        # Breakdown per day (last 7 days)
        today = datetime.today().date()
        days = [
            (today - timedelta(days=i)) for i in range(6, -1, -1)
        ]
        per_day = []
        for day in days:
            minutes = queryset.filter(date=day).aggregate(s=Sum('minutes'))['s'] or 0
            per_day.append({
                "date": str(day),
                "minutes": minutes
            })

        return Response({
            "total_minutes": total_minutes,
            "per_day": per_day
        })
