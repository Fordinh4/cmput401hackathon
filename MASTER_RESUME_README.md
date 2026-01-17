# Master Resume Feature - Setup & Usage Guide

## Overview
This feature allows users to:
- Create and manage a master resume in LaTeX format
- View jobs with "yet_to_apply" status
- Generate AI-tailored resumes for specific jobs using OpenAI
- Track a "coolness level" that measures how close the edited resume is to AI suggestions
- Export tailored resumes as PDFs

## Setup Instructions

### Backend Setup

1. **Install Python dependencies** (already done):
   ```bash
   cd myproject
   source venv/bin/activate
   pip install openai python-dotenv
   ```

2. **Configure OpenAI API Key**:
   ```bash
   cd myproject
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run migrations** (already done):
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser** (for Django admin):
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install Node dependencies** (already done):
   ```bash
   cd Uncooked
   npm install
   ```

2. **Start the React dev server**:
   ```bash
   npm run dev
   ```

### LaTeX Setup (for PDF export)

Install LaTeX on your system:
- **macOS**: `brew install --cask mactex` or `brew install basictex`
- **Linux**: `sudo apt-get install texlive-latex-base texlive-latex-extra`
- **Windows**: Install MiKTeX or TeX Live

## API Endpoints

### Master Resume
- `GET /api/resume/master/` - Get master resume
- `POST /api/resume/master/` - Create/update master resume

### Jobs
- `GET /api/jobs/` - List all jobs
- `POST /api/jobs/` - Create new job
- `GET /api/jobs/yet_to_apply/` - Get jobs with "yet_to_apply" status
- `PATCH /api/jobs/{id}/update_status/` - Update job status

### Tailored Resumes
- `POST /api/resume/tailored/tailor/{job_id}/` - Generate AI-tailored resume for job
- `GET /api/resume/tailored/{id}/` - Get tailored resume
- `PATCH /api/resume/tailored/{id}/` - Update tailored resume (recalculates coolness)
- `GET /api/resume/tailored/{id}/compile_pdf/` - Download resume as PDF

## Usage Flow

### 1. Create Master Resume
1. Go to **Master Resume** page
2. Edit the LaTeX template or create your own
3. Click **Save Master Resume**

### 2. Add Jobs via Django Admin
1. Go to `http://localhost:8000/admin`
2. Add JobApplications with:
   - Company name
   - Position
   - Job description
   - Status: "yet_to_apply"

### 3. Generate Tailored Resumes
1. Go to **Yet to Apply Jobs** page
2. Click **Generate Tailored Resume** on any job
3. AI will create an optimized version based on the job description

### 4. Edit & Track Coolness
1. On the tailored resume page:
   - **Left editor**: AI-suggested LaTeX (read-only)
   - **Right editor**: Your version (editable)
2. Make edits in the right editor
3. Click **Save Changes** to update coolness level
4. Click **Accept AI Suggestion** to restore 100% coolness
5. Click **Download PDF** to export

## Coolness Level Explained
- **100%** 🔥: Identical to AI suggestion (Very Cool!)
- **80-99%** 🔥: Very close to AI suggestion
- **50-79%** 👍: Moderate changes (Pretty Cool)
- **0-49%** ❄️: Major deviations (Getting Cold...)

The coolness level uses text similarity (SequenceMatcher) to compare your edits against the AI-suggested version.

## Features Implemented

### Backend ✅
- Django models for MasterResume, JobApplication, TailoredResume, ResumeSection
- REST API with DRF ViewSets
- OpenAI integration for resume tailoring
- Coolness level calculation algorithm
- LaTeX to PDF compilation
- Django admin interface

### Frontend ✅
- React with React Router for navigation
- Monaco Editor for LaTeX editing with syntax highlighting
- Master Resume Editor component
- Yet to Apply Jobs list component
- Tailored Resume view with split editor
- Visual coolness indicator with progress bar
- PDF download functionality

## Testing Tips

1. **Test without AI first**: Comment out the OpenAI call and return mock data to test the flow
2. **Use Django admin**: Easily add test jobs and view data
3. **Check coolness tracking**: Make small edits and save to see coolness change
4. **Test PDF export**: Ensure LaTeX is installed and working

## Troubleshooting

### "No module named 'openai'"
- Make sure venv is activated: `source venv/bin/activate`
- Install: `pip install openai`

### "OPENAI_API_KEY not found"
- Create `.env` file in `myproject/` directory
- Add your API key: `OPENAI_API_KEY=sk-...`

### PDF compilation fails
- Install LaTeX: `brew install basictex` (macOS)
- Check if `pdflatex` is in PATH: `which pdflatex`

### CORS errors
- Ensure Django is running on `localhost:8000`
- Check `settings.py` has correct CORS configuration

## Next Steps / Enhancements

1. **Add user authentication** - Multi-user support
2. **Real-time coolness updates** - Calculate as you type (debounced)
3. **Resume templates** - Provide multiple LaTeX templates
4. **Version history** - Track changes over time
5. **Bulk operations** - Generate resumes for all "yet to apply" jobs
6. **Better PDF preview** - Show PDF inline instead of download only

## Notes for Your Team

- This is YOUR section of the hackathon project
- The master resume feature is independent and can be demoed separately
- Other team members handle: job tracking, application status, etc.
- Your unique feature: **AI tailoring + coolness level tracking**

Good luck with the hackathon! 🚀
