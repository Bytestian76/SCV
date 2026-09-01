@echo off
chcp 65001 > nul
title Sistema de Control Vehicular (SCV) - Normetales Movilidad
echo ===================================================================
echo     Iniciando SCV (Sistema de Control Vehicular)
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando base de datos SQLite...
api-services\venv\Scripts\python.exe api-services\scripts\init_db.py

echo.
echo [2/3] Iniciando Backend FastAPI en http://localhost:8000 ...
start "SCV - Backend (FastAPI)" cmd /k "cd /d ""%~dp0api-services"" && venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak > nul

echo [3/3] Iniciando Frontend React en http://localhost:8080 ...
start "SCV - Frontend (React PWA)" cmd /k "cd /d ""%~dp0client-app"" && ""%~dp0api-services\venv\Scripts\python.exe"" -m http.server 8080"

timeout /t 2 /nobreak > nul

echo.
echo ===================================================================
echo  SCV iniciado correctamente.
echo  - Frontend React: http://localhost:8080
echo  - Backend API: http://localhost:8000
echo  - Documentacion Swagger: http://localhost:8000/docs
echo.
echo  Abriendo navegador en http://localhost:8080 ...
echo ===================================================================

start http://localhost:8080

pause