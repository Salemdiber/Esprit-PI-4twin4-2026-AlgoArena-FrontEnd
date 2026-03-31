@echo off
REM 🚀 Quick Start Script for AlgoArena Playground Frontend (Windows)
REM 
REM Usage: Double-click this file or run in PowerShell:
REM start.bat

setlocal enabledelayedexpansion

echo🎯 AlgoArena Playground Frontend Starter
echo ==========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install node.js ^>= 18.x
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ⚠️  First install failed, trying with legacy peer deps...
        call npm install --legacy-peer-deps
    )
) else (
    echo ✅ Dependencies already installed
)

echo.
echo ==========================================
echo 🚀 Starting development server...
echo ==========================================
echo.
echo Frontend will start on: http://localhost:5173
echo Playground page: http://localhost:5173/playground/challenges
echo.
echo Make sure your NestJS backend is running on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start dev server
call npm run dev

pause
