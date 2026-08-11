# ElektroHesap Pro — Kurulum ve Çalıştırma

Bu proje **iki parçalıdır**: Python backend (hesaplamalar) + HTML/JS frontend (arayüz). Bu yüzden **Live Server ile açmak çalışmaz** — her iki sunucu da aynı anda çalışmalıdır.

## ⚠️ İlk Önce ZIP'i Doğru Çıkart!

ZIP'i çıkarttıktan sonra klasör yapısı şöyle olmalı:

```
elektrohesap-pro/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── modules/
│   │   ├── server.py, kablo_kesidi.py, busbar.py, ...
│   └── data/
│       └── nyy_kablolar.json, busbar.json, sorti.json
├── frontend/
│   ├── package.json
│   └── public/
│       ├── index.html      ← Ana sayfa BURADA
│       ├── pages/          ← 6 modül sayfası
│       ├── css/            ← style, layout, components
│       └── js/             ← api.js, main.js, modules/
├── start-windows.bat        ← Windows'ta çift tıklayın
├── start-linux-mac.sh       ← Mac/Linux için
└── README-download.md       ← Bu dosya
```

Eğer dosyalarınız **düz sıralanmışsa** (tümü aynı klasörde), ZIP'i tekrar çıkarın. Windows'ta ZIP'e sağ tıklayıp **"Tümünü Çıkart..."** seçin (sürükle-bırak değil).

---

## 🚀 En Kolay Yol — Otomatik Script

### Windows
1. **Python** kurun: https://www.python.org/downloads/ (kurulumda **"Add to PATH"** kutucuğunu işaretleyin)
2. **Node.js** kurun: https://nodejs.org/ (LTS sürümü)
3. **Yarn** kurun: PowerShell'de `npm install -g yarn`
4. **`start-windows.bat`** dosyasına çift tıklayın
5. İlk çalıştırmada paketler yüklenir (~3 dk), sonra iki komut penceresi açılır
6. Otomatik olarak tarayıcı `http://localhost:3000` adresini açar

### Mac / Linux
```bash
chmod +x start-linux-mac.sh
./start-linux-mac.sh
```

---

## 📋 Manuel Kurulum (script yerine)

### Backend (1. terminal)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# .env dosyası oluştur (bir defalık)
echo MONGO_URL=mongodb://localhost:27017 > .env
echo DB_NAME=elektrohesap >> .env
echo CORS_ORIGINS=* >> .env

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend (2. terminal — ayrı pencere)
```bash
cd frontend
yarn install
yarn start
```

Tarayıcı: **http://localhost:3000**  
API dokümantasyonu: **http://localhost:8001/docs**

---

## 💾 MongoDB Zorunlu Mu?

**Hayır.** MongoDB sadece **ziyaret & hesap sayacı** için kullanılır. Kurmak istemezseniz, `backend/server.py` içinde şu satırları yorum satırı yapın:

```python
# mongo_url = os.environ['MONGO_URL']
# mongo_client = AsyncIOMotorClient(mongo_url)
# db = mongo_client[os.environ['DB_NAME']]
db = None  # ← Bunu ekleyin
```

Ve `shared.db = db` satırını yorum satırı yapın. Tüm hesaplama modülleri MongoDB olmadan tam çalışır.

---

## ❓ VS Code'da Python Dosyaları Neden Sarı?

**Neden:** VS Code Python paketlerini (fastapi, pydantic vs.) bulamıyor.

**Çözüm:**
1. VS Code'da `Ctrl+Shift+P` → **"Python: Select Interpreter"**
2. `backend/venv` içindeki `python.exe` seçin (script çalıştıktan sonra oluşur)
3. Sarı işaretler kaybolur

Kod aslında hatasız — sadece VS Code'un lokalindeki eksik durumu gösteriyor.

---

## 🌐 Local Kurulmadan Denemek

Uygulamanın canlı versiyonu:  
**https://power-hub-63.preview.emergentagent.com/**

Buradan tüm modülleri hemen kullanabilirsiniz — kurulum yapmadan.

---

## 🐛 Sorun Giderme

| Hata | Çözüm |
|---|---|
| `python' is not recognized` | Python'u tekrar kurun, **"Add to PATH"** kutucuğunu işaretleyin |
| `yarn' is not recognized` | `npm install -g yarn` |
| Port 3000 kullanımda | `frontend/package.json` içinde `-p 3000` → `-p 3001` |
| Port 8001 kullanımda | `uvicorn server:app --port 8002` (frontend `api.js`'te `/api` → `http://localhost:8002/api`) |
| API çağrıları 404 | Backend çalışmıyor. 1. terminali kontrol edin. |
| MongoDB error | Yukarıdaki "MongoDB Zorunlu Mu?" bölümüne bakın |
