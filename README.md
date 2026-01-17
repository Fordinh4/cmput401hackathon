# CMPUT401_Hackathon
# Django + Vite React Project

## Prerequisites
- Python 3.8+
- Node.js 16+
- pip

## Setup Instructions

### Backend (Django)
1. Navigate to the Django project folder:
```bash
   cd myproject
```

2. Create a virtual environment (recommended):
```bash
   python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
   pip install -r requirements.txt
```

5. Run migrations:
```bash
   python manage.py migrate
```

6. Start the Django server:
```bash
   python manage.py runserver
```
   Django will run on http://localhost:8000

### Frontend (Vite + React)
1. Navigate to the frontend folder:
```bash
   cd my-frontend
```

2. Install dependencies:
```bash
   npm install
```

3. Start the development server:
```bash
   npm run dev
```
   Vite will run on http://localhost:5173

## Running the Project
You need to run both servers simultaneously in separate terminals.
```

## Files to Push to Git

Make sure these files are in your repository:
- `myproject/requirements.txt` (Django dependencies)
- `my-frontend/package.json` (already there - Node dependencies)
- `README.md` (setup instructions)

## Files to IGNORE (Add to .gitignore)

Create a `.gitignore` file if you don't have one:
```
# Python
venv/
__pycache__/
*.pyc
db.sqlite3

# Node
node_modules/
dist/

# Environment variables
.env