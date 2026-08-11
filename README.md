ElektroHesap, elektrik tesisat projelerinde, şantiyelerde ve  mühendislik
standartlara  hesaplamalarında sıkça ihtiyaç duyulan teknik analizleri hızlı,
uygun ve hatasız bir şekilde gerçekleştirmek için geliştirilmiş Full-Stack web platformudur.

Karmaşık formüller ve Excel tabloları arasında kaybolmak yerine; kablo kesit tayininden trafo
kompanzasyonuna, busbar gerilim düşümünden sorti hesaplarına kadar tüm süreçleri tek bir arayüzden yönetmenizi sağlar.

Bu Proje Ne İşe Yarar?
Proje, elektrik mühendisliği ve taahhüt sektöründeki temel hesaplama standartlarını (IEC, TSE vb.) temel alarak aşağıdaki modülleri sunar:

Kablo Kesit Tayini & Gerilim Düşümü: Yük (kW/kVA), mesafe ve akım değerlerine göre optimum kablo kesitini hesaplar; gerilim düşümü ve akım taşıma kapasitesi kontrolü yapar.

Orta Gerilim (OG) Hesapları: OG şebekeleri ve hücre/kablo seçimleri için teknik hesaplama arayüzü.

Busbar Sistem Hesapları: Busbar hatlarındaki gerilim düşümü ve yük dağılımı analizleri.

Trafo & Kompanzasyon Hesabı: Trafo gücü tespiti, güç faktörü ($\cos \phi$) düzeltmesi ve gerekli kondansatör gücü hesaplaması.

NYY Kablo & Akım Taşıma Cetvelleri: Standart NYY kablo verilerine dayalı hızlı sorgulama ve akım limiti kontrolü.

Aydınlatma & Kuvvet Sorti Hesabı: Bina içi tesisat projelerinde sorti hatları ve yük dağılımı hesabı.

Kimler Kullanabilir?
Elektrik & Elektronik Mühendisleri: Proje tasarım ve onay süreçlerinde hızlı doğrulama yapmak için.

Elektrik Teknikerleri & Proje Çizenler: Sık tekrarlanan tesisat hesaplamalarında zamandan kazanmak için.

Şantiye ve Saha Mühendisleri: Sahada anlık kablo, busbar veya trafo kapasitesi kontrolleri yapmak için.

Mühendislik Öğrencileri: Güç sistemleri ve tesisat derslerindeki hesaplama mantığını görselleştirmek ve doğrulamak için.

Projenin Çalıştırılması
Proje, bağımlılıkları ve servisleri tek tıkla başlatacak hazır betiklerle birlikte gelir.

1. Depoyu Klonlayın
Bash
git clone https://github.com/kullanici-adi/elektrohesap.git
cd elektrohesap
2. Tek Tıkla Başlatın
Windows Kullanıcıları İçin:
Ana dizindeki start-windows.bat dosyasına çift tıklayın.

Linux / macOS Kullanıcıları İçin:
Terminalden şu komutu çalıştırın:

Bash
chmod +x start-linux-mac.sh
./start-linux-mac.sh
Betik otomatik olarak gerekli Python paketlerini (requirements.txt) yükleyecek ve sunucuyu başlatacaktır.

 Proje Dizin Yapısı
Plaintext
.
├── backend/
│   ├── data/             # NYY, Busbar ve Sorti standart verileri (JSON)
│   ├── modules/          # Mühendislik hesaplama motorları (Python)
│   ├── server.py         # API Sunucusu
│   └── requirements.txt  # Python bağımlılıkları
├── frontend/
│   └── public/
│       ├── css/          # Bilesen ve sayfa stilleri
│       ├── js/           # Arayuz modulleri ve API baglantilari
│       └── pages/        # Modul sayfaları (kablo-kesidi, trafo vb.)
├── start-windows.bat     # Windows baslatici
└── start-linux-mac.sh   # Linux/Mac baslatici

Katkıda Bulunma (Contributing)
Sektörel standartlara yeni hesaplama modülleri eklemek veya mevcut modülleri geliştirmek isterseniz pull request (PR) göndermekten çekinmeyin!

Bu depoyu çatallayın (Fork)

Yeni özelliğinizi dallandırın (git checkout -b feature/YeniModul)

Değişikliklerinizi kaydedin (git commit -m 'yeni: Jenerator hesabi eklendi')

Dalınıza itin (git push origin feature/YeniModul)

Bir Pull Request açın

Lisans: MIT Lisansı altındadır. Dilediğiniz gibi geliştirebilir ve kullanabilirsiniz.









