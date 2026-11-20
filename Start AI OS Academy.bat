@echo off
title AI OS Academy
cd /d "%~dp0"

echo ===============================================
echo   AI OS Academy - starting on your computer
echo ===============================================
echo.

if not exist "node_modules" (
  echo First-time setup - installing. This runs once and may take a few minutes...
  call npm install
  echo.
)

echo Opening http://localhost:3400 in your browser...
start "" "http://localhost:3400"
echo.
echo Keep this black window OPEN while you use the app.
echo To stop the app: close this window, or press Ctrl+C.
echo.
call npm run dev
pause
