from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse, FileResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import MasterResume, JobApplication, TailoredResume, ResumeSection
from .serializers import (
    MasterResumeSerializer, JobApplicationSerializer,
    TailoredResumeSerializer, TailoredResumeUpdateSerializer
)
from .services import analyze_resume_for_job, recheck_resume_improvements, check_relevant_experience


def hello(request):
    return JsonResponse({'message': 'Hello from Django!', 'status': 'success'})


class MasterResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing master resumes"""
    queryset = MasterResume.objects.all()
    serializer_class = MasterResumeSerializer

    def list(self, request):
        """Get the latest master resume (assuming one per user for now)"""
        resume = self.queryset.first()
        if resume:
            serializer = self.get_serializer(resume)
            return Response(serializer.data)
        return Response(None, status=status.HTTP_204_NO_CONTENT)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job applications"""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

    @action(detail=False, methods=['get'])
    def yet_to_apply(self, request):
        """Get all jobs with 'yet_to_apply' status"""
        jobs = self.queryset.filter(application_status='yet_to_apply')
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update job application status"""
        job = self.get_object()
        new_status = request.data.get('application_status')
        
        if new_status not in ['yet_to_apply', 'applied']:
            return Response(
                {'error': 'Invalid status. Must be "yet_to_apply" or "applied"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job.application_status = new_status
        job.save()
        
        serializer = self.get_serializer(job)
        return Response(serializer.data)


class TailoredResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing tailored resumes"""
    queryset = TailoredResume.objects.all()
    serializer_class = TailoredResumeSerializer

    @action(detail=False, methods=['post'], url_path='tailor/(?P<job_id>[^/.]+)')
    def tailor_for_job(self, request, job_id=None):
        """Generate AI-tailored resume for a specific job"""
        try:
            # Get the job and master resume
            job = get_object_or_404(JobApplication, id=job_id)
            master_resume = MasterResume.objects.first()
            
            if not master_resume:
                return Response(
                    {'error': 'No master resume found. Please create one first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Use HTML content
            resume_content = master_resume.html_content
            
            # Analyze resume and get suggestions
            analysis = analyze_resume_for_job(
                resume_content,
                job.description
            )
            
            # Create tailored resume with AI analysis
            from django.utils import timezone
            tailored_resume = TailoredResume.objects.create(
                master_resume=master_resume,
                job_application=job,
                current_html=master_resume.html_content,  # Start with master HTML
                initial_cookedness_score=analysis.get('cookedness_score', 100),
                current_cookedness_score=analysis.get('cookedness_score', 100),
                ai_suggestions=analysis.get('suggestions', []),
                improvement_history=[{
                    'timestamp': timezone.now().isoformat(),
                    'score': analysis.get('cookedness_score', 100),
                    'reasoning': analysis.get('reasoning', '')
                }]
            )
            
            serializer = self.get_serializer(tailored_resume)
            response_data = serializer.data
            response_data['has_relevant_experience'] = True
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def partial_update(self, request, pk=None):
        """Update tailored resume (save HTML changes)"""
        tailored_resume = self.get_object()
        serializer = TailoredResumeUpdateSerializer(tailored_resume, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Update HTML content
            if 'current_html' in serializer.validated_data:
                tailored_resume.current_html = serializer.validated_data['current_html']
            tailored_resume.save()
            
            return Response(TailoredResumeSerializer(tailored_resume).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def check_improvements(self, request, pk=None):
        """Check and re-evaluate resume improvements"""
        try:
            tailored_resume = self.get_object()
            
            # Get the last checked version (stored when we last ran check_improvements)
            # If this is the first check, use the master resume as baseline
            improvement_history = tailored_resume.improvement_history or []
            if len(improvement_history) > 0:
                # Use the stored full content from last check, not the snippet
                previous_content = improvement_history[-1].get('full_html_snapshot', tailored_resume.master_resume.html_content)
            else:
                previous_content = tailored_resume.master_resume.html_content
            
            # Use HTML content
            current_content = tailored_resume.current_html
            
            # If content hasn't changed since last check, don't re-evaluate
            if previous_content == current_content:
                return Response({
                    'message': 'No changes detected. Please edit your resume before checking improvements.',
                    'current_score': tailored_resume.current_cookedness_score,
                    'ai_suggestions': tailored_resume.ai_suggestions
                }, status=status.HTTP_200_OK)
            
            # Re-evaluate with AI
            evaluation = recheck_resume_improvements(
                previous_html=previous_content,
                current_html=current_content,
                job_description=tailored_resume.job_application.description,
                previous_score=tailored_resume.current_cookedness_score,
                previous_suggestions=tailored_resume.ai_suggestions
            )
            
            # Update the resume with new evaluation
            from django.utils import timezone
            tailored_resume.current_cookedness_score = evaluation.get('new_score', tailored_resume.current_cookedness_score)
            tailored_resume.ai_suggestions = evaluation.get('new_suggestions', [])
            
            # Add to improvement history
            new_history_entry = {
                'timestamp': timezone.now().isoformat(),
                'previous_score': tailored_resume.current_cookedness_score,
                'new_score': evaluation.get('new_score'),
                'score_change': evaluation.get('score_change', 0),
                'followed_suggestions': evaluation.get('followed_suggestions', []),
                'improvement_notes': evaluation.get('improvement_notes', ''),
                'html_snapshot': current_content[:500],  # Store snippet for reference
                'full_html_snapshot': current_content  # Store full content for next comparison
            }
            tailored_resume.improvement_history.append(new_history_entry)
            tailored_resume.save()
            
            # Return evaluation results
            response_data = TailoredResumeSerializer(tailored_resume).data
            response_data['evaluation'] = evaluation
            return Response(response_data)
        
        except Exception as e:
            return Response(
                {'error': f'Failed to check improvements: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def compile_pdf(self, request, pk=None):
        """Compile HTML to PDF (current/user version)"""
        tailored_resume = self.get_object()
        
        try:
            from weasyprint import HTML, CSS
            from io import BytesIO
            
            # Use HTML content
            html_content = tailored_resume.current_html
            
            # Wrap HTML in a styled document for professional resume look
            full_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page {{
            size: Letter;
            margin: 0.75in;
        }}
        body {{
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            max-width: 100%;
        }}
        h1 {{ font-size: 20pt; margin: 0 0 8pt 0; }}
        h2 {{ font-size: 14pt; margin: 16pt 0 8pt 0; border-bottom: 1px solid #000; padding-bottom: 2pt; }}
        h3 {{ font-size: 12pt; margin: 12pt 0 6pt 0; }}
        p {{ margin: 6pt 0; }}
        ul, ol {{ margin: 6pt 0; padding-left: 24pt; }}
        li {{ margin: 3pt 0; }}
        strong {{ font-weight: 600; }}
        a {{ color: #000; text-decoration: underline; }}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""
            
            # Generate PDF
            pdf_bytes = BytesIO()
            HTML(string=full_html).write_pdf(pdf_bytes)
            pdf_bytes.seek(0)
            
            response = HttpResponse(pdf_bytes.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="resume_{tailored_resume.job_application.position}.pdf"'
            return response
        
        except Exception as e:
            return Response(
                {'error': f'PDF generation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
