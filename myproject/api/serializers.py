from rest_framework import serializers
from .models import MasterResume, JobApplication, TailoredResume, ResumeSection


class MasterResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterResume
        fields = ['id', 'name', 'html_content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            'id', 'company_name', 'position', 'description', 
            'application_status', 'date_added', 'date_applied'
        ]
        read_only_fields = ['id', 'date_added']


class ResumeSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSection
        fields = [
            'id', 'section_type', 'original_content', 
            'ai_suggested_content', 'final_content', 'order'
        ]
        read_only_fields = ['id']


class TailoredResumeSerializer(serializers.ModelSerializer):
    sections = ResumeSectionSerializer(many=True, read_only=True)
    job_application = JobApplicationSerializer(read_only=True)
    cooked_level = serializers.IntegerField(source='current_cookedness_score', read_only=True)
    
    class Meta:
        model = TailoredResume
        fields = [
            'id', 'master_resume', 'job_application', 
            'current_html', 'cooked_level',
            'initial_cookedness_score', 'current_cookedness_score',
            'ai_suggestions', 'improvement_history',
            'created_at', 'updated_at', 'sections'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'cooked_level',
            'initial_cookedness_score', 'current_cookedness_score',
            'ai_suggestions', 'improvement_history'
        ]


class TailoredResumeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating tailored resume content"""
    class Meta:
        model = TailoredResume
        fields = ['current_html']
