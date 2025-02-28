@echo off
echo Starting NeuraCollab...

REM Create and activate virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate

REM Install dependencies and setup
echo Checking dependencies...
python start_app.py

REM Keep the window open to see any errors
pause
