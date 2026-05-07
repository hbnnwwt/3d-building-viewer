@echo off
setlocal

cd /d "%~dp0"

echo Starting viewer (port 5173)...
start "Viewer" cmd /c "cd /d "%~dp0apps\viewer" && pnpm dev"

echo Starting editor (port 5174)...
start "Editor" cmd /c "cd /d "%~dp0apps\editor" && pnpm dev"

echo.
echo Services started:
echo   Viewer:  http://localhost:5173
echo   Editor:  http://localhost:5174
echo.
echo Press any key to exit
pause >nul