@echo off
setlocal

cd /d "%~dp0"

echo Killing processes on ports 5173, 5174...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo Removing old node_modules...
rmdir /S /Q node_modules 2>nul
rmdir /S /Q apps\viewer\node_modules 2>nul
rmdir /S /Q apps\editor\node_modules 2>nul

echo Installing dependencies...
call pnpm install

echo.
echo Setup complete!
echo.
echo To start development:
echo   dev.bat         Start viewer and editor
echo.
echo   Viewer:  http://localhost:5173
echo   Editor:  http://localhost:5174
echo.
pause