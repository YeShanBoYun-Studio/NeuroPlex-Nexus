@echo off
echo Starting NeuraCollab...
echo.

REM Check for Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python not found. Please install Python 3.9 or later.
    exit /b 1
)

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js 16 or later.
    exit /b 1
)

REM Create and activate virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install backend dependencies if needed
if not exist venv\Lib\site-packages\neuracollab (
    echo Installing backend dependencies...
    pip install -e ".[dev]"
)

REM Initialize backend if needed
if not exist neuracollab.db (
    echo Initializing database...
    python -m neuracollab.init_db
)

REM Install frontend dependencies if needed
if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Start frontend and backend servers in parallel
start cmd /k "title NeuraCollab Frontend && cd frontend && npm run dev"
start cmd /k "title NeuraCollab Backend && python start_app.py"

echo.
echo NeuraCollab is starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
echo Press Ctrl+C in the respective windows to stop the servers.
