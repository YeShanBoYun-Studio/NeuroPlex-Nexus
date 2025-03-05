@echo off
REM Check if virtual environment exists
IF NOT EXIST venv (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -e .[all]
) ELSE (
    call venv\Scripts\activate
)

REM Start frontend development server in background
start cmd /c "cd frontend && (where pnpm >nul 2>nul && pnpm install || npm install) && npm run dev"

REM Start backend server
python start_app.py
