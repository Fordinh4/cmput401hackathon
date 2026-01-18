from django.db import models

class JobPostingInfo(models.Model):
    url = models.URLField(max_length=500)
    job_title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    job_description = models.TextField()
    max_salary = models.FloatField(null=True, blank=True)
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=50)
    deadline = models.DateTimeField(null=True, blank=True)
    date_applied = models.DateTimeField(auto_now_add=True)
    cooked_level = models.IntegerField(default=0)
    tasks = models.JSONField(default=dict)

