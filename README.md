# Web Programlama - Dönem Sonu Projesi: Kurumsal Görev Paneli ve İzleme Altyapılı CV Sistemi

## 1. Proje Özeti
Bu proje deposu (repository), **Web Programlama** dersi kapsamında baştan sona yapılandırılmış üç temel modülü içermektedir:
1. **Corporate Task Dashboard (Kurumsal Görev Paneli):** Dış kütüphane kullanılmadan (Zero-dependency) inşa edilmiş Vanilla JS ve CSS3 odaklı tek sayfalı uygulama (SPA). (Erişim: `/`)
2. **Semantik CV:** Sadece HTML5 standartları ve anlamsal etiketlerle (semantic tags) kurgulanmış web sayfası. (Erişim: `/cv`)
3. **Analitik İzleme ve Sayaç (Node.js):** CV sayfasını ziyaret eden tekil ve toplam kullanıcıları çerez kontrolü (cookie) ile sayan backend altyapısı. (Erişim: `/stats`)

## 2. Geliştirilen İşlevler ve Çalışma Mantığı
### A - Corporate Task Dashboard (Görev Paneli)
- **State Yönetimi:** Görev listeleri, saf ES6+ ile JavaScript içerisinde izole edilerek (Module Pattern) kontrol edilmektedir. Global scope kirliliği önlenmiştir.
- **Performans:** Yeni bir görev eklenirken sayfa yenilenmez. DOM modifikasyonları, `DocumentFragment` API'si ile optimize edilmiştir ve tarayıcının reflow/repaint donmaları asgari seviyeye indirilmiştir.
- **Persistency (Kalıcılık):** Tüm form ve görev verileri tarayıcı hafızasına (`localStorage`) anında aktarılır; cihaz veya sekme kapatıldığında verilerin daimi olması güvenceye alınmıştır.
- **Tasarım Mimarisi:** Responsive, modern CSS Variable'larla desteklenen 'Kurumsal' (Corporate Blue) tema kullanılmıştır.

### B - Node.js Analitik Sistemi ve Ziyaretçi Sayacı
- Ziyaret edilen ekrana yapılan ilk HTTP isteğinde, `crypto` modülü yardımıyla rastgele bir `cv_vid` eşsiz kimliği üretilir ve istemciye cookie olarak gönderilir.
- **Farklı Kişi (Unique) Tespiti:** Çerez verisi mevcutta var ise, bu kullanıcı bilinen (tanınan) misafir listesinde sayılır.
- **Refresh Spam Koruması:** Kullanıcı sürekli sayfayı yenilese dahi, sistem toplam görüntüleme (Total Views) miktarını **10 dakika bekleme (cooldown)** kuralına uygunsa artırır.
- Veriler sunucu belleğinde geçici kalmaz, arkaplanda asenkron bir biçimde `analytics.json` dosyasına yazılır.

## 3. Kurulum ve Çalıştırma (Lokal Ortam)

```bash
# Proje dizinine gidin
cd "c:\Users\User\Desktop\Web Programlama"

# Sunucuyu başlatın
npm start
```
* **Görev Paneli (Ana Sayfa):** `http://localhost:3000/` veya uygulamanın atadığı portta örn. `http://localhost:3001/`
* **CV Sayfası:** `http://localhost:3000/cv`
* **İstatistikler:** `http://localhost:3000/stats`

## 4. Kullanılan Teknolojiler
- **Backend:** Node.js (Saf `http`, `fs`, `crypto`, `path` modülleri kullanılmıştır, Express.js gibi bağımlılıklardan arındırılmıştır).
- **Frontend:** Vanilla JS (ES6+), Modern CSS3 (Grid/Flexbox), HTML5 A11y.
- **Database:** JSON tabanlı dosya mekanizması.

## 5. Dağıtım (Deploy) Rehberi

### Render (render.com) Deployment
1. Render paneline girin -> **New +** -> **Web Service**
2. GitHub reponuzu seçin.
3. Ayarlar bölümünden:
   - **Environment:** Node
   - **Build Command:** *(Boş bırakılabilir)*
   - **Start Command:** `node server.js`
4. Deploy işlemi bitince verilen URL üzerinden tüm projeyi (Dashboard, CV, Stats) inceleyebilirsiniz.

### Railway (railway.app) Deployment
1. Railway sistemine giriş yapınız -> **New Project** -> **Deploy from GitHub Repo**
2. İlgili Reponuzu seçip dağıtımı başlatın.
3. Komut sistemi `npm start` olarak çalışacaktır.

## 6. Proje Dosya Yapısı (Teslim Listesi)
- `index.html` & `style.css` & `script.js` -> Görev Paneli Modülü (Corporate Task Dashboard)
- `cv.html` -> Saf HTML Semantik CV Sayfası
- `server.js` -> Ana HTTP Sunucusu ve Routing Servisleri
- `analytics.js` & `analytics.json` -> Çerez bazlı trafik tespit ve sayaç mantığı
- `package.json` -> Bağımsızlık script'i (NPM Start)
- `README.md` -> Proje Akademik Dokümantasyonu

## 7. Sistem Sınırlamaları ve Notlar
- Tekil (Unique) sayımı Cookie altyapısına dayanır. Kullanıcı çerezleri temizler veya incognito (gizli) pencere açarsa sunucu tarafından yeni olarak sayılır.
- Free web hosting hizmetlerinde dosya sistemine kalıcı yazım kısıtlanabiliyorsa `analytics.json` sunucu uyku moduna geçip kalktığında resetlenebilir.
