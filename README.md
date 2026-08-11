# Elektrik Hesaplama Platformu

Elektrik tesisat projelerinde, elektrik taahhüt işlerinde ve şantiye ortamında ihtiyaç duyulan teknik hesaplamaları hızlı, standartlara uygun ve hatasız bir şekilde gerçekleştirmek için tasarlanmış full-stack web uygulaması. Kablo kesiti tayininden trafo kompanzasyonuna, busbar gerilim düşümünden sorti analizlerine kadar tüm süreçleri tek platformda toplar.

**Python (FastAPI/Flask)** arka uç, **HTML5, CSS3 + JavaScript (ES6 Modules)** ön uç ile; modüler mühendislik mimarisine uygun olarak yapılandırıldı.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji](#teknoloji)
- [Proje yapısı](#proje-yapısı)


---

## Özellikler

- **Kablo kesidi & gerilim düşümü** — Yük, mesafe ve akım değerlerine göre optimum kablo kesiti seçimi; gerilim düşümü ve akım taşıma kapasitesi kontrolü
- **Orta gerilim (OG) hesapları** — OG şebekeleri ve hücre/kablo seçimleri için teknik hesaplama arayüzü
- **Busbar sistem hesapları** — Busbar hatlarındaki gerilim düşümü ve yük dağılımı analizleri
- **Trafo & kompanzasyon hesabı** — Trafo gücü tespiti, güç faktörü ($\cos \phi$) düzeltmesi ve kondansatör gücü hesaplaması
- **NYY kablo cetvelleri** — Standart NYY kablo verilerine dayalı hızlı sorgulama ve akım limiti kontrolü
- **Aydınlatma & kuvvet sorti hesabı** — Tesisat projelerinde sorti hatları ve yük dağılımı hesabı

---

## Teknoloji

| Katman | Teknoloji |
| :--- | :--- |
| **Arka uç (Backend)** | Python 3.x, FastAPI / Flask |
| **Ön uç (Frontend)** | HTML5, CSS3 (Modular Styles), JavaScript (ES6 Modules) |
| **Veritabanı / Veri** | JSON Data Tables, MongoDB |
| **Ortam / Çalıştırma** | `.bat` (Windows) & `.sh` (Linux/macOS) Otomasyon Betikleri |

---

## Proje yapısı

```text
elektrohesap/
├── backend/                  # Python API sunucusu ve hesaplama motorları
│   ├── data/                 # NYY, Busbar ve Sorti verileri (JSON)
│   ├── modules/              # Mühendislik hesaplama modülleri (.py)
│   ├── server.py             # Sunucu giriş noktası
│   └── requirements.txt      # Python bağımlılıkları
├── frontend/                 # Web arayüzü dosyaları
│   └── public/
│       ├── css/              # Stil dosyaları (components, layout, style)
│       ├── js/               # Arayüz mantığı ve JS modülleri
│       └── pages/            # Hesaplama modül sayfaları (.html)
├── start-windows.bat         # Windows için tek tıkla başlatıcı
└── start-linux-mac.sh       # Linux/macOS için tek tıkla başlatıcı
