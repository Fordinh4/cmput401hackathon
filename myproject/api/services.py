import os
from openai import OpenAI
from dotenv import load_dotenv
from difflib import SequenceMatcher

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def analyze_resume_for_job(resume_html: str, job_description: str) -> dict:
    """
    Analyze how well a resume matches a job and provide improvement suggestions.
    
    Args:
        resume_html: The resume content in HTML format
        job_description: The job description to analyze against
    
    Returns:
        Dictionary with:
        - cookedness_score: 0-100 (0=perfectly tailored, 100=generic/not tailored)
        - suggestions: list of specific improvement suggestions
        - reasoning: explanation of the score
    """
    prompt = f"""You are an expert resume advisor. Analyze this resume against the job description and provide a "cookedness score" and improvement suggestions.

COOKEDNESS SCORE (0-100) - LOWER IS BETTER:
- 0-20 = EXCELLENT: Resume is highly tailored to this specific job, relevant projects/skills are prominently featured, strong match with job requirements
- 21-50 = GOOD: Resume has relevant content but could emphasize job-specific skills more, some reordering would help
- 51-80 = NEEDS WORK: Resume is somewhat generic, relevant experience exists but isn't highlighted effectively
- 81-100 = POOR: Resume is very generic, doesn't emphasize relevant experience, major tailoring needed

Your job: Evaluate how well this resume is ALREADY TAILORED to this specific job and suggest SPECIFIC, ACTIONABLE improvements.

SCORING RULES:
- If user makes the resume MORE tailored to the job → score should DECREASE
- If user removes relevant content or makes it more generic → score should INCREASE
- If no meaningful changes → score stays the same

IMPORTANT:
- Only suggest changes to EXISTING content (reorder, reword, emphasize)
- NEVER suggest adding fake experience or skills
- Be specific: mention actual sections, bullet points, or skills to modify
- Focus on what already exists in the resume that could be better highlighted for THIS specific job

Resume Content:
{resume_html}

Job Description:
{job_description}

Respond with ONLY a JSON object in this exact format:
{{
  "cookedness_score": <number 0-100>,
  "reasoning": "<brief explanation of score>",
  "suggestions": [
    {{
      "category": "<section name or 'general'>",
      "suggestion": "<specific actionable improvement>",
      "priority": "<high/medium/low>",
      "suggested_text": "<the actual text user should add/replace - be specific and provide the exact wording they can copy/paste>"
    }}
  ]
}}

No other text, just the JSON."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume advisor who responds only with JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        import json
        result = json.loads(response.choices[0].message.content.strip())
        return result
    
    except Exception as e:
        raise Exception(f"Failed to analyze resume: {str(e)}")


def recheck_resume_improvements(
    previous_html: str,
    current_html: str,
    job_description: str,
    previous_score: int,
    previous_suggestions: list
) -> dict:
    """
    Re-evaluate resume after user makes improvements.
    
    Args:
        previous_html: The previous version of the resume
        current_html: The updated version of the resume
        job_description: The job description
        previous_score: The previous cookedness score
        previous_suggestions: The previous list of suggestions
    
    Returns:
        Dictionary with:
        - new_score: updated cookedness score
        - followed_suggestions: which suggestions were implemented
        - new_suggestions: additional improvements needed
        - improvement_notes: feedback on what was done well
    """
    suggestions_text = "\n".join([f"- {s.get('suggestion', '')}" for s in previous_suggestions])
    
    prompt = f"""You are an expert resume advisor. The user updated their resume based on your previous suggestions.

Evaluate the improvements and provide updated feedback.

PREVIOUS COOKEDNESS SCORE: {previous_score}/100
PREVIOUS SUGGESTIONS:
{suggestions_text}

PREVIOUS VERSION:
{previous_html}

UPDATED VERSION:
{current_html}

JOB DESCRIPTION:
{job_description}

COOKEDNESS SCORE (0-100) - LOWER IS BETTER:
- 0-20 = EXCELLENT: Resume is highly tailored to this job
- 21-50 = GOOD: Resume has relevant content but could be better
- 51-80 = NEEDS WORK: Resume is somewhat generic
- 81-100 = POOR: Resume is very generic

SCORING RULES:
- If changes made the resume MORE tailored/relevant to this job → new_score should be LOWER than {previous_score}
- If changes removed relevant content or made it more generic → new_score should be HIGHER than {previous_score}
- If no meaningful improvements → new_score stays similar to {previous_score}
- score_change = new_score - {previous_score} (negative = improvement, positive = worse)

Your tasks:
1. Calculate a NEW cookedness score (0-100) based on how tailored the UPDATED version is
2. Identify which suggestions were followed
3. Provide new suggestions if score is still not 0-20
4. Give positive feedback on improvements made

Respond with ONLY a JSON object:
{{
  "new_score": <number 0-100>,
  "score_change": <negative number if improved, positive if worse>,
  "followed_suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "improvement_notes": "<positive feedback on changes made>",
  "new_suggestions": [
    {{
      "category": "<section name>",
      "suggestion": "<specific improvement>",
      "priority": "<high/medium/low>",
      "suggested_text": "<the actual text user should add/replace - be specific and provide the exact wording they can copy/paste>"
    }}
  ]
}}

No other text, just the JSON."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert resume advisor who responds only with JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        import json
        result = json.loads(response.choices[0].message.content.strip())
        return result
    
    except Exception as e:
        raise Exception(f"Failed to recheck resume: {str(e)}")


def calculate_cooked_level(ai_suggested: str, current_content: str) -> int:
    """
    Calculate how 'cooked' the resume is (0-100).
    Lower is better (uncooked = raw/authentic = good).
    Higher = more cooked = over-processed = bad.
    
    Args:
        ai_suggested: The AI-suggested LaTeX content
        current_content: The current user-edited content
    
    Returns:
        Cooked level (0-100), where 0 means fully uncooked (user's authentic version)
        and 100 means fully cooked (identical to AI, no personality)
    """
    if not ai_suggested or not current_content:
        return 100  # No content = fully cooked (bad)
    
    # Use SequenceMatcher to calculate similarity
    similarity = SequenceMatcher(None, ai_suggested, current_content).ratio()
    
    # Convert to 0-100 scale (higher similarity = more cooked = worse)
    cooked_level = int(similarity * 100)
    
    return max(0, min(100, cooked_level))


# Alias for backward compatibility if needed elsewhere
calculate_coolness_level = calculate_cooked_level


def check_relevant_experience(master_latex: str, job_description: str) -> dict:
    """
    Check if the master resume has relevant experience/projects for the job.
    Returns a dict with has_relevant_experience and suggestions if needed.
    
    Args:
        master_latex: The master resume in LaTeX format
        job_description: The job description to check against
    
    Returns:
        Dictionary with:
        - has_relevant_experience: bool
        - suggestions: list of project suggestions (if not relevant)
    """
    prompt = rf"""You are an expert career advisor. Analyze this resume and job description.

Determine if the candidate has ANY relevant experience or projects that could apply to this job.
Be lenient - even tangentially related experience counts.

Master Resume (LaTeX):
{master_latex}

Job Description:
{job_description}

Respond with ONLY a JSON object in this exact format:
{{
  "has_relevant_experience": true or false,
  "reason": "brief explanation"
}}

No other text, just the JSON."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert career advisor who responds only with JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        
        import json
        result = json.loads(response.choices[0].message.content.strip())
        
        if not result.get('has_relevant_experience', True):
            # Generate project suggestions
            suggestions = generate_project_suggestions(master_latex, job_description)
            return {
                'has_relevant_experience': False,
                'reason': result.get('reason', 'No relevant experience found'),
                'suggestions': suggestions
            }
        
        return {
            'has_relevant_experience': True,
            'reason': result.get('reason', 'Relevant experience found')
        }
    
    except Exception as e:
        # If check fails, assume they have relevant experience (safe default)
        return {
            'has_relevant_experience': True,
            'reason': f'Check failed: {str(e)}'
        }


def generate_project_suggestions(master_latex: str, job_description: str) -> list:
    """
    Generate project suggestions that would help build relevant experience.
    
    Args:
        master_latex: The master resume in LaTeX format
        job_description: The job description
    
    Returns:
        List of project suggestion dicts with title, description, skills, and timeline
    """
    prompt = rf"""You are a career advisor. This candidate wants to apply for a job but lacks relevant experience.

Generate 3-5 realistic project suggestions they could build to gain relevant skills.
Projects should:
- Be achievable in 2-8 weeks
- Build skills directly mentioned in the job description
- Be portfolio-worthy
- Not be too complex or require unrealistic resources

Candidate's Current Skills (from resume):
{master_latex}

Target Job:
{job_description}

Respond with ONLY a JSON array of projects in this exact format:
[
  {{
    "title": "Project Name",
    "description": "2-3 sentence description of what to build",
    "skills_gained": ["skill1", "skill2", "skill3"],
    "estimated_time": "X weeks",
    "difficulty": "Beginner/Intermediate/Advanced"
  }}
]

No other text, just the JSON array."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a career advisor who responds only with JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        import json
        suggestions = json.loads(response.choices[0].message.content.strip())
        return suggestions
    
    except Exception as e:
        return [{
            'title': 'Build a relevant project',
            'description': f'Error generating suggestions: {str(e)}',
            'skills_gained': [],
            'estimated_time': 'N/A',
            'difficulty': 'N/A'
        }]
