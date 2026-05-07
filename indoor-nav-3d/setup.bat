@echo off
setlocal

cd /d "%~dp0"

echo Installing dependencies...
call pnpm install

echo Generating Prisma client...
cd server
call pnpm db:generate
cd ..

echo Pushing database schema...
cd server
call pnpm db:push
cd ..

echo.
echo Setup complete!
echo.
echo To start development:
echo   dev.bat         Start all services
echo   dev-server.bat  Start server only
echo   dev-viewer.bat  Start viewer only
pause