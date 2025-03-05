@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo Starting NeuraCollab development environment...
echo =========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Create and activate virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -e .[all]
) else (
    call venv\Scripts\activate.bat
)

REM Set up frontend
if not exist frontend (
    echo Frontend directory not found
    pause
    exit /b 1
)

echo Setting up frontend...
cd frontend
call npm install

REM Start frontend in a new window
start "NeuraCollab Frontend" cmd /k "title Frontend Server && npm run dev"

REM Return to root directory and start backend
cd ..
echo Starting backend server...
python start_app.py

endlocal
