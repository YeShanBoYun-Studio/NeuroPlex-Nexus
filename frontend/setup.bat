@echo off
setlocal enabledelayedexpansion

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_VER=%%a.%%b.%%c
)
set NODE_VER=%NODE_VER:v=%
set REQUIRED_VER=18.0.0

echo Node.js version: %NODE_VER%
if "%NODE_VER%" lss "%REQUIRED_VER%" (
    echo Error: Node.js version must be ^>= %REQUIRED_VER%
    exit /b 1
)

:: Create necessary directories
echo Creating necessary directories...
if not exist "src\assets" mkdir "src\assets"
if not exist "src\components" mkdir "src\components"
if not exist "src\contexts" mkdir "src\contexts"
if not exist "src\hooks" mkdir "src\hooks"
if not exist "src\pages" mkdir "src\pages"
if not exist "src\services" mkdir "src\services"
if not exist "src\types" mkdir "src\types"
if not exist "src\utils" mkdir "src\utils"

:: Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

:: Setup git hooks
echo Setting up git hooks...
node init-husky.js
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to setup git hooks
    exit /b 1
)

:: Create environment files if they don't exist
if not exist .env.development (
    echo Creating .env.development...
    copy .env.example .env.development
)

if not exist .env.production (
    echo Creating .env.production...
    copy .env.example .env.production
)

:: Initialize TypeScript
echo Checking TypeScript setup...
call npx tsc --noEmit
if %ERRORLEVEL% neq 0 (
    echo Warning: TypeScript check failed
)

:: Run linter
echo Running linter...
call npm run lint
if %ERRORLEVEL% neq 0 (
    echo Warning: Linter found issues
)

:: Format code
echo Formatting code...
call npm run format
if %ERRORLEVEL% neq 0 (
    echo Warning: Code formatting failed
)

echo.
echo Setup complete! 🎉
echo.
echo Next steps:
echo 1. Review and update .env.development and .env.production
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.

pause
endlocal
