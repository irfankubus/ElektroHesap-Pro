#!/bin/bash
# ============================================================
# ElektroHesap Pro - Linux/Mac Otomatik Başlatma Scripti
# ============================================================
set -e

echo ""
echo "=== ElektroHesap Pro başlatılıyor... ==="
echo ""

# --- Backend ---
cd backend
if [ ! -d "venv" ]; then
    echo "[1/4] Python sanal ortamı oluşturuluyor..."
    python3 -m venv venv
fi
source venv/bin/activate

echo "[2/4] Python paketleri yükleniyor..."
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    cat > .env <<EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=elektrohesap
CORS_ORIGINS=*
EOF
    echo "  .env dosyası oluşturuldu."
fi

echo "[3/4] Backend başlatılıyor (port 8001)..."
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!

cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "[4/4] Frontend paketleri yükleniyor..."
    yarn install
fi

echo "Frontend başlatılıyor (port 3000)..."
yarn start &
FRONTEND_PID=$!

sleep 2
echo ""
echo "=== Hazır! ==="
echo "  Ana Sayfa:   http://localhost:3000"
echo "  API Docs:    http://localhost:8001/docs"
echo ""
echo "Durdurmak için Ctrl+C'ye basınız."

# Ctrl+C ile temiz kapatma
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
