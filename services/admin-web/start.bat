@echo off
title FirstShift local preview
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required: https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies for the first run...
  call npx -y yarn@1.22.22 install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting the dev server. The browser will open http://localhost:3000/firstshift
echo Close this window to stop the server.
echo.
call "node_modules\.bin\vite.cmd" --open /firstshift

echo.
echo Server stopped.
pause
