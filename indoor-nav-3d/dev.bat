@echo off
setlocal

cd /d "%~dp0"

echo Starting server (port 3001)...
start "Server" /min cmd /c "cd server && pnpm dev"

echo Starting viewer (port 5173)...
start "Viewer" /min cmd /c "cd apps\viewer && pnpm dev"

echo.
echo Services starting:
echo   Server:  http://localhost:3001
echo   Viewer:  http://localhost:5173
echo.
echo Press any key to exit
pause >nul