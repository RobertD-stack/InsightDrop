@echo off
REM AI File Classifier - Startup Script (Batch)
REM Starts both backend and frontend servers

echo.
echo ==========================================
echo   AI FILE CLASSIFIER - STARTUP
echo ==========================================
echo.

echo Starting Backend Server...
start "Backend - Python/Flask" python backend_server.py

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend - React/Vite" npm run dev

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   APPLICATION READY!
echo ==========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo Close the server windows to stop the application.
echo.
pause

