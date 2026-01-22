@echo off
echo ==========================================
echo   Admin Engine Backend - Auto Start
echo ==========================================

cd backend-core

echo [1/3] Testing Database Connection...
node db/test_connect.js
IF %ERRORLEVEL% NEQ 0 (
   echo.
   echo [ERROR] Connection test failed. Please check your internet or credentials.
   pause
   exit /b 1
)

echo.
echo [2/3] Setting up Database (Migrations & Seeds)...
call npm run db:setup
IF %ERRORLEVEL% NEQ 0 (
   echo.
   echo [ERROR] Database setup failed.
   pause
   exit /b 1
)

echo.
echo [3/3] Starting Server...
npm start
