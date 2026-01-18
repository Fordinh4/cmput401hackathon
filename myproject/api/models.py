from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class MasterResume(models.Model):
    """Stores the user's master resume"""
    name = models.CharField(max_length=255, default="Master Resume")
    html_content = models.TextField(help_text="HTML resume content from rich text editor", blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Updated: {self.updated_at.strftime('%Y-%m-%d')})"


class JobApplication(models.Model):
    """Stores job application details"""
    STATUS_CHOICES = [
        ('Applying', 'Applying'),
        ('Applied', 'Applied'),
        ('Interviewing', 'Interviewing'),
        ('Negotiating', 'Negotiating'),
        ('Accepted', 'Accepted'),
        ('No Response', 'No Response'),
    ]
    
    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    description = models.TextField(help_text="Job description/requirements")
    application_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Applying'
    )
    date_added = models.DateTimeField(auto_now_add=True)
    date_applied = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_added']

    def __str__(self):
        return f"{self.position} at {self.company_name} ({self.application_status})"


class TailoredResume(models.Model):
    """Stores AI-tailored resume versions for specific jobs"""
    master_resume = models.ForeignKey(MasterResume, on_delete=models.CASCADE, related_name='tailored_versions')
    job_application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='tailored_resumes')
    base_resume = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='derived_resumes', help_text="Resume used as base (if built upon another tailored resume)")
    
    current_html = models.TextField(help_text="Current HTML resume content", default="")
    
    # Suggestion-based fields
    initial_cookedness_score = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Initial AI analysis score (0=perfect, 100=generic)"
    )
    current_cookedness_score = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Current cookedness score after improvements (0=perfect, 100=generic)"
    )
    ai_suggestions = models.JSONField(
        default=list,
        help_text="List of AI suggestions for improvement"
    )
    improvement_history = models.JSONField(
        default=list,
        help_text="History of score changes and improvements made"
    )
    
    # Legacy field - kept for backwards compatibility
    coolness_level = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Legacy: Cooked level (0=uncooked/authentic, 100=overcooked/AI copy)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Tailored resume for {self.job_application.position} (Cooked: {self.current_cookedness_score}%)"


class ResumeSection(models.Model):
    """Stores individual sections of a tailored resume"""
    SECTION_TYPES = [
        ('contact', 'Contact Information'),
        ('summary', 'Summary'),
        ('experience', 'Experience'),
        ('education', 'Education'),
        ('skills', 'Skills'),
        ('other', 'Other'),
    ]
    
    tailored_resume = models.ForeignKey(TailoredResume, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    original_content = models.TextField(help_text="Original content from master resume")
    ai_suggested_content = models.TextField(help_text="AI-suggested modifications")
    final_content = models.TextField(help_text="Final user-edited content")
    order = models.IntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.get_section_type_display()} - {self.tailored_resume.job_application.position}"
