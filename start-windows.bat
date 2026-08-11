@echo off
REM ============================================================
REM ElektroHesap Pro - Windows Otomatik Baslatma Scripti
REM ============================================================
REM Bu script backend (FastAPI) ve frontend (http-server) uygulamalarini
REM iki ayri komut penceresinde baslatir.
REM
REM ILK CALISTIRMA icin gereksinimler:
REM   1. Python 3.9+ kurulu olmali  (https://www.python.org/downloads/)
REM   2. Node.js kurulu olmali        (https://nodejs.org/)
REM   3. (Opsiyonel) MongoDB kurulu    (https://www.mongodb.com/try/download/community)
REM      -- MongoDB yoksa analytics calismaz ama hesaplamalar sorunsuz calisir.
REM ============================================================

echo.
echo === ElektroHesap Pro baslatiliyor... ===
echo.

REM --- Backend hazirligi ---
cd backend
if not exist "venv\" (
    echo [1/4] Python sanal ortami olusturuluyor...
    python -m venv venv
)
call venv\Scripts\activate
echo [2/4] Python paketleri yukleniyor (fastapi, pydantic, motor)...
pip install -q -r requirements.txt

if not exist ".env" (
    echo MONGO_URL=mongodb://localhost:27017> .env
    echo DB_NAME=elektrohesap>> .env
    echo CORS_ORIGINS=*>> .env
    echo    .env dosyasi olusturuldu.
)

echo [3/4] Backend baslatiliyor (port 8001)...
start "ElektroHesap Backend" cmd /k "cd /d %cd% && venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"

cd ..\frontend
if not exist "node_modules\" (
    echo [4/4] Frontend paketleri yukleniyor...
    call yarn install
) else (
    echo [4/4] Frontend paketleri hazir.
)
echo Frontend baslatiliyor (port 3000)...
start "ElektroHesap Frontend" cmd /k "cd /d %cd% && yarn start"

timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo === Hazir! ===
echo   Ana Sayfa:   http://localhost:3000
echo   API Docs:    http://localhost:8001/docs
echo.
echo Uygulamayi kapatmak icin acilan iki komut penceresini kapatiniz.
pause
