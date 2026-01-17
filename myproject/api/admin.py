from django.contrib import admin
from .models import MasterResume, JobApplication, TailoredResume, ResumeSection


@admin.register(MasterResume)
class MasterResumeAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['position', 'company_name', 'application_status', 'date_added']
    list_filter = ['application_status']
    search_fields = ['position', 'company_name']


@admin.register(TailoredResume)
class TailoredResumeAdmin(admin.ModelAdmin):
    list_display = ['job_application', 'coolness_level', 'created_at']
    list_filter = ['coolness_level']


@admin.register(ResumeSection)
class ResumeSectionAdmin(admin.ModelAdmin):
    list_display = ['section_type', 'tailored_resume', 'order']
    list_filter = ['section_type']
