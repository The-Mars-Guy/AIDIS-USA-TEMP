@echo off
setlocal EnableExtensions
title IAASEE United States - Dev Server
cd /d "%~dp0"

echo ==========================================================
echo   IAASEE United States - temporary local runner
echo ==========================================================
echo.

REM ---------------------------------------------------------
REM  1) Check for Node.js (which ships npm)
REM ---------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on your PATH.
  echo.
  echo   Install the LTS version from: https://nodejs.org/
  echo   Then close this window, reopen it, and run run.bat again.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo [OK] Node.js detected: %NODE_VER%

REM ---------------------------------------------------------
REM  2) Check for npm
REM ---------------------------------------------------------
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found on your PATH.
  echo.
  echo   npm normally installs with Node.js. Reinstall Node.js ^(LTS^)
  echo   from https://nodejs.org/ and make sure "Add to PATH" is checked.
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('npm -v 2^>nul') do set "NPM_VER=%%v"
echo [OK] npm detected: v%NPM_VER%
echo.

REM ---------------------------------------------------------
REM  3) Make sure we are in the project folder (package.json)
REM ---------------------------------------------------------
if not exist "package.json" (
  echo [ERROR] package.json was not found in this folder:
  echo         %CD%
  echo.
  echo   Put run.bat next to package.json and try again.
  echo.
  pause
  exit /b 1
)
echo [OK] Project folder: %CD%
echo.

REM ---------------------------------------------------------
REM  4) Enforce a modern Node version ^(Vite needs Node 18+^)
REM ---------------------------------------------------------
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>=18?0:1)"
if errorlevel 1 (
  echo [ERROR] Node.js %NODE_VER% is too old. Vite requires Node.js 18 or newer.
  echo.
  echo   Please install the current LTS from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM ---------------------------------------------------------
REM  5) Install dependencies on first run (or if missing)
REM ---------------------------------------------------------
if not exist "node_modules\" (
  echo [INFO] Dependencies not installed yet. Running "npm install"...
  echo        ^(this can take a minute on the first run^)
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] "npm install" failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
  echo.
  echo [OK] Dependencies installed.
) else (
  echo [OK] Dependencies already installed ^(node_modules present^).
)
echo.

REM ---------------------------------------------------------
REM  6) Start the dev server
REM ---------------------------------------------------------
echo ==========================================================
echo   Starting the local site...
echo   A browser tab should open shortly. Close this window
echo   or press Ctrl+C to stop the server.
echo ==========================================================
echo.

call npm run dev
set "EXITCODE=%ERRORLEVEL%"

echo.
if not "%EXITCODE%"=="0" (
  echo [ERROR] The dev server exited with code %EXITCODE%.
  echo         See the messages above for details.
) else (
  echo [OK] Dev server stopped.
)
pause
endlocal
