# ElektroHesap Pro — PRD

## Original Problem Statement
Mühendislik hesaplama modüllerini tek çatı altında toplayan, açık renkli, modern ve profesyonel bir web portalı. 6 modül: Kablo Kesidi, Trafo & Kompanzasyon, Busbar Hatları, Orta Gerilim Malzeme, NYY Kablo Veri Tablosu, Sorti Hesapları. Türkçe arayüz. Vanilla HTML/CSS/JS + FastAPI. Hesaplama formülleri mevcut Excel projesiyle (ElektrikXLS_rev01) birebir aynı.

## Architecture
- **Frontend:** Vanilla HTML5 + CSS3 + JavaScript, statik dosyalar /app/frontend/public/ altında, http-server ile 3000 portunda servis ediliyor.
- **Backend:** FastAPI (/app/backend/server.py) + modular routers, MongoDB (analytics için), port 8001.
- **Klasör yapısı:** Problem statement'taki spec ile birebir uyumlu (backend/modules/, frontend/pages/, css/, js/modules/).
- **Data:** JSON dosyaları backend/data/ altında (NYY 43 kablo, Busbar 52 tip, Sorti 23 malzeme × 10 tip × 3 tablo).

## Core Requirements — Implemented (Şubat 2026)
- [x] Ana sayfa: 6 modül kartlı grid + sol sidebar + üst header + canlı analytics stripı
- [x] Sol sidebar (mobil hamburger menü ile responsive)
- [x] **Kablo Kesidi:** P, U, cosφ, mesafe, NYY kesit, hat sayısı ve yan yana katsayı — I, akım kap., ΔU, ağırlık, uygunluk raporu
- [x] **Trafo & Kompanzasyon:** Pk × Ku × Diversite → S (standart trafo snap), I1/I2, Q (kompanzasyon), ana ve komp. şalter, kısa devre Icu
- [x] **Busbar Hatları:** A/B kolu, dinamik segment editörü, cascading kalan güç, ΔU = √3·L·I·(R·cosφ + XL·sinφ), toplam ΔU ≤ %3
- [x] **Orta Gerilim:** I1/I2, koruma CT (Class 3), ölçü CT (Class 0.5), nominal akım oranı
- [x] **NYY Tablosu:** 43 kablo, arama ile filtre
- [x] **Sorti Hesapları:** 3 tablo (NYA / N2XH / N2XH+EMT), 10 sortie tipi (5 sıva altı + 5 nemliyer), fiyat düzenleme + anlık yeniden hesap
- [x] MongoDB analytics (ziyaret + modül bazlı hesap sayısı) → ana sayfada gösteriliyor
- [x] Print-friendly (yazdır butonu, print CSS ile sidebar/butonlar gizleniyor)
- [x] Renk paleti (#1E3A8A lacivert, #3B82F6 aksan, #10B981 başarı, #F59E0B uyarı)
- [x] Inter + Poppins font kombinasyonu

## Modules
| Modül | Backend | Frontend | Formüller |
|---|---|---|---|
| Kablo | /api/kablo/hesapla | /pages/kablo-kesidi.html | I = P·1000/(U·cosφ·√3); ΔU = P·1000·L/(56·S·U) |
| Trafo | /api/trafo/hesapla | /pages/trafo.html | Pr=Pk·Ku·kd; S=trafo(Pr/cosφ); Q=S·0.9·(tan(acos(cosφ_m))-tan(acos(cosφ_h))) |
| Busbar | /api/busbar/hesapla | /pages/busbar.html | ΔU=√3·L·I·(R·cosφ+XL·sinφ) |
| OG | /api/orta-gerilim/hesapla | /pages/orta-gerilim.html | I=S/(U·√3); CT=ctr(I) |
| NYY | /api/nyy/tablo | /pages/nyy.html | Statik veri |
| Sorti | /api/sorti/hesapla | /pages/sorti.html | Malzeme × miktar × birim fiyat |

## What's NOT Included (Deferred)
- PDF export (print-friendly ile yerine)
- Kullanıcı hesabı / geçmiş kayıt
- Karanlık tema toggle
- Çoklu dil (TR/EN)
- Excel dışa aktarma

## Backlog (P1/P2)
- PDF export (jsPDF veya WeasyPrint ile)
- Excel export
- Karanlık tema
- Hesap paylaşma bağlantısı (URL query-string ile önceden doldurulmuş form)
- Kullanıcı geçmişi (MongoDB ile)
- Çoklu dil (i18n)
