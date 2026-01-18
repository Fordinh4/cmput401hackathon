from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
import json

from .models import JobPostingInfo


@api_view(["GET", "POST"])
@csrf_exempt
def jobs_list(request):
    """Get all jobs (GET) or create a new job (POST)."""
    if request.method == "GET":
        jobs = JobPostingInfo.objects.all().values(
            "id",
            "url",
            "job_title",
            "company",
            "job_description",
            "max_salary",
            "location",
            "status",
            "deadline",
            "date_applied",
            "cooked_level",
            "tasks",
        )
        return Response(list(jobs), status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        data = request.data
        
        # Required fields
        job_title = data.get("job_title", "").strip()
        job_description = data.get("job_description", "").strip()
        
        if not job_title or not job_description:
            return Response(
                {"error": "job_title and job_description are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse max_salary
        try:
            max_salary = float(data.get("max_salary", 0)) if data.get("max_salary") else None
        except (TypeError, ValueError):
            return Response(
                {"error": "max_salary must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse cooked_level
        try:
            cooked_level = int(data.get("cooked_level", 0)) if data.get("cooked_level") else 0
        except (TypeError, ValueError):
            return Response(
                {"error": "cooked_level must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse dates
        date_applied = data.get("date_applied")
        if date_applied:
            try:
                # Try ISO format first
                parsed_date_applied = parse_datetime(date_applied)
                if not parsed_date_applied:
                    parsed_date_applied = datetime.fromisoformat(date_applied)
            except (ValueError, TypeError):
                parsed_date_applied = datetime.now()
        else:
            parsed_date_applied = datetime.now()

        deadline = data.get("deadline")
        parsed_deadline = None
        if deadline:
            try:
                parsed_deadline = parse_datetime(deadline)
                if not parsed_deadline:
                    parsed_deadline = datetime.fromisoformat(deadline)
            except (ValueError, TypeError):
                pass

        # Create job
        job = JobPostingInfo(
            url=data.get("url", "https://example.com").strip(),
            job_title=job_title,
            company=data.get("company", "Unknown").strip(),
            job_description=job_description,
            max_salary=max_salary,
            location=data.get("location", "Unknown").strip(),
            status=data.get("status", "Applying"),
            deadline=parsed_deadline,
            date_applied=parsed_date_applied,
            cooked_level=cooked_level,
            tasks=data.get("tasks", {}),
        )
        
        job.save()
        
        return Response(
            {
                "id": job.id,
                "message": "Job created successfully",
                "job_title": job.job_title,
                "company": job.company,
            },
            status=status.HTTP_201_CREATED
        )


@api_view(["GET"])
def view_page(request, id):
    """Return a single job posting by id."""
    job = get_object_or_404(JobPostingInfo, pk=id)
    return Response(
        {
            "id": job.id,
            "url": job.url,
            "job_title": job.job_title,
            "company": job.company,
            "job_description": job.job_description,
            "max_salary": job.max_salary,
            "location": job.location,
            "status": job.status,
            "deadline": job.deadline.isoformat() if job.deadline else None,
            "date_applied": job.date_applied.isoformat() if job.date_applied else None,
            "cooked_level": job.cooked_level,
            "tasks": job.tasks,
        },
        status=status.HTTP_200_OK,
    )