@echo off
cd /d "%~dp0"
echo === Installing dependencies ===
call pnpm install
echo.
echo === Done! Run dev.bat to launch ===
pause
