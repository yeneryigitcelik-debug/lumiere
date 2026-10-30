# Storefront doğrulama

## Kapsam

Değişiklikler yalnızca storefront arayüzü, test/fixture dosyaları ve bağımlılık yamalarıyla sınırlıdır. Auth API, ödeme backend'i, Prisma şeması ve iş fiyatları değişmedi.

### Gerçek düzeltmeler

- **Hero:** SSR içeriği 3D/WebGL yüklenmesini beklemeden görünür; mobil düzen, `prefers-reduced-motion` desteği ve görünür klavye odağı.
- **Navbar:** Erişilebilir mobil menü (ARIA durumları, odak yönetimi, Escape ile kapanma).
- **Sepet:** Kalıcı veri migrasyonu, hydration uyumsuzluğu giderildi; okunamayan/engellenmiş depolama verisi silinmeden korunur.
- **Varyant seçici / sepete ekle:** Erişilebilir seçim ve ekleme geri bildirimi.
- **Giriş:** Asenkron gönderimde eski (stale) yanıtların durumu ezmesini önleyen koruma.
- **Ürün 3D:** Yalnızca ürünün gerçek model URL'si kullanılır; sahte/jenerik model gösterilmez.
- **Bağımlılıklar:** Next 16.4.3, Prisma 7.10.1 (client/adapter hizalı). `iyzipay` altındaki `postman-request` için resmi SDK önerisiyle uyumlu `qs 6.16.1` ve `uuid 11.1.1` override. Üretim audit bulguları 32 → 0.

## Komutlar (Node 22, npm)

```bash
npm ci --ignore-scripts
npm run prisma:generate
```

Şema gerekiyorsa yalnızca **size ait, boş, tek kullanımlık** bir PostgreSQL 17 fixture veritabanına uygulayın:

```bash
DATABASE_URL=<boş-fixture-veritabanı> npx prisma db push
```

> Uyarı: `DATABASE_URL` asla normal geliştirme, staging veya üretim veritabanını göstermemelidir. Seed veya müşteri verisi kullanılmaz.

```bash
npm test                              # 18 sözleşme testi: 15 sepet + 3 SDK (loopback üzerinde gerçek HMAC, harici sağlayıcı yok)
npm run lint:storefront               # yalnızca değişen UI + yeni test/fixture; 0 hata/uyarı
npx tsc --noEmit --incremental false
npx playwright install --with-deps chromium
npm run test:browser                  # 38 tarayıcı testi, desktop + mobile
npm run build                         # varsayılan Next build (Turbopack)
npm audit --omit=dev --audit-level=moderate
```

Tarayıcı testleri fixture dışındaki tüm HTTP isteklerini iptal eder, WebGL stub'ı ve sentetik Next/auth adaptörleri kullanır. Test atlama (skip) yoktur.

## CI

`.github/workflows/storefront-quality.yml`: `codex/**` dallarında push ve `main` hedefli pull request, salt okunur `contents` izni, sırsız; yalnızca işe ait boş PostgreSQL 17 servisi ve açık dummy `DATABASE_URL`. Force-dynamic sayfalar prerender edilmediğinden build teknik olarak DB'siz çalışabilir, ancak açık servis en güvenli yoldur. Build, varsayılan olarak public Google Fonts'u indirir (GitHub'da izinli).

## Tam lint durumu

Başlangıçtaki dört dosyada eski HEAD kaynaklarıyla 17 hata yeniden üretildi. Kategori listesi okuma, profil düzenleme taslağı ve dekoratif GPU parçacıkları sınırlı olarak temizlendi; kural bastırılmadı. Tam depo lint sonucu: 0 hata, 2 önceden mevcut uyarı. CI tam depo lint çalıştırır.

## Yerel doğrulama notu

Çevrimdışı ortamda tam webpack build; yalnızca framework font mock'u (yerel Arial) ve güncel Prisma motoru ile boş PG17 üzerinde sentetik kategori/ürün/varyant + rollback ile geçti. Font mock'u veya motor ayarı gönderilmez.

## Yönetim ekranındaki mevcut eksik

Kategori ekle/sil düğmeleri mevcut kaynakta placeholder; kategori yazma API uçları yok. Bu çalışma yeni CMS veya kategori CRUD eklemiyor; yalnızca liste okuma hatası ve bileşen yaşam döngüsünü düzeltir. Tam yönetim işleyişi tamamlandı iddiası yoktur.

## Sınırlamalar

- Canlı by-collection alan adı bilinmiyor; canlı ortamda test yapılmadı.
- Gerçek GPU shader veya cihaz performansı ölçülmedi. Animasyonlu hero DOM/odak/hareket tercihi, yetenek taklidiyle ayrıca test edilir; bu GPU kanıtı değildir.
- Canlı ödeme, e-posta, Google giriş, oturum ve checkout tamamlama testi yok.
- Ekran görüntüleri yedek fontlarla alınmıştır.
- Bu çalışma deploy veya merge içermez.
