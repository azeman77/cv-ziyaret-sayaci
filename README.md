# CV Ziyaret Sayacı (Node.js)

## Türkçe

Bu repo, ödev kapsamında hazırlanan basit bir **CV görüntülenme analitiği** uygulamasıdır.

- `cv.html` sayfasının **toplam görüntülenme** sayısını tutar.
- Aynı kişinin tekrar girişlerini **cookie (cv_vid)** ile ayırt ederek **farklı kişi (unique)** sayısını hesaplar.
- Toplam görüntülenme sayısı, aynı ziyaretçi için **en az 10 dakika** aralıkla artırılır (sayfa yenilemesi ile şişmesin diye).
- İstatistikler ayrı bir sayfada gösterilir: `/stats`.

## English

This repository is a simple **CV page view analytics** app built for an assignment.

- Tracks the **total number of views** for `cv.html`.
- Uses a browser cookie (`cv_vid`) to identify returning visitors and compute **unique visitors**.
- The total view counter is rate-limited per visitor to **at least 10 minutes** (to avoid inflating counts by page refresh).
- Statistics are displayed on a separate page: `/stats`.

---

## Sayfalar

- `GET /cv` (veya `/`) → `cv.html` sayfasını gösterir ve görüntülenmeyi kaydeder
- `GET /stats` → toplam görüntüleme ve farklı kişi sayılarını gösterir

## Nasıl çalışır?

- CV sayfası açıldığında sunucu `cv_vid` adlı cookie'yi kontrol eder.
- Cookie yoksa yeni bir kimlik üretir ve tarayıcıya yazar.
- Aynı tarayıcı cookie'yi silmediği sürece tekrar girse bile **unique artmaz**.
- Toplam görüntüleme sayısı, aynı ziyaretçi için **en az 10 dakika** aralıkla artırılır (sayfa yenilemesi ile şişmesin diye).
- Veriler `analytics.json` dosyasında saklanır.

## Kurulum / çalıştırma (Windows - PowerShell)

- `cd "c:\Users\User\Desktop\Web Programlama"`
- `npm start`
- Tarayıcı:
  - `http://localhost:3000/cv`
  - `http://localhost:3000/stats`

## Deploy (Render)

1. Render → **New +** → **Web Service**
2. GitHub repo’nu seç
3. Ayarlar:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy bitəndən sonra Render sənə URL verəcək:
   - `https://<app-adiniz>.onrender.com/cv`
   - `https://<app-adiniz>.onrender.com/stats`

## Deploy (Railway)

1. Railway → **New Project** → **Deploy from GitHub Repo**
2. Repo’nu seç → Deploy
3. Start command avtomatik tapılmazsa: `npm start`
4. Railway URL verəcək:
   - `https://<app-adiniz>.up.railway.app/cv`
   - `https://<app-adiniz>.up.railway.app/stats`

## Teslim kontrol listesi

- CV sayfası: `cv.html`
- Sayaç ve unique mantığı: `analytics.js`
- Sunucu: `server.js`
- Kalıcı veri: `analytics.json`
- Proje ayarları: `package.json`
- Açıklama: `README.md`

## Sınırlamalar

- Unique sayımı cookie tabanlıdır.
- Cookie silinirse veya farklı tarayıcı/cihaz kullanılırsa yeni kullanıcı sayılır.
- `analytics.json` dosyası dosya sistemine yazdığı için bazı hostinglerde (yeniden başlatmada) sıfırlanabilir.
