@echo off
echo ========================================================
echo   Starting CloudPi IoT Cloud Infrastructure Platform
echo ========================================================

echo Starting Backend Server on http://localhost:3001...
start "CloudPi Server" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Dashboard on http://localhost:5173...
start "CloudPi Dashboard" cmd /k "cd /d %~dp0dashboard && npm run dev"

echo.
echo All services launched!
echo - API Server: http://localhost:3001
echo - Web Dashboard: http://localhost:5173
echo ========================================================
pause

