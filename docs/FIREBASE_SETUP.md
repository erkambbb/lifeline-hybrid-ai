# Firebase kurulumu: senin yapacakların

Bu adımlar Google hesabınla konsolda tıklama gerektirdiği için sana kaldı.
👤 işareti, adımı senin yapman gerektiğini gösterir.

Bu dokümandaki konsol yolları 4 Kasım 2026'da resmi dokümanlardan alındı.
Konsol arayüzü değişmiş olabilir. Bir menüyü bulamazsan
[AI Logic başlangıç sayfasına](https://firebase.google.com/docs/ai-logic/get-started)
bak.

Firebase projesi olmadan da on-device testi çalışır. Yalnızca bulut yolu kapalı
kalır.

## 0. Yarışmaya kaydol

1. 👤 <https://firebasehybridaihackathon.devpost.com/> sayfasını aç ve
   **Join hackathon** düğmesine tıkla.
2. 👤 9 Kasım'da **Rules** sekmesini oku. Kurallar yayınlanınca
   `docs/ROADMAP.md` içindeki kontrol listesini uygula.

## 1. Firebase projesini oluştur

1. 👤 <https://console.firebase.google.com/> adresine git.
2. 👤 Yeni proje oluştur. Ad önerisi: `lifeline-hybrid-ai`.
3. 👤 Google Analytics sorulursa kapat. AI Logic için gerekli değil.

## 2. Web uygulamasını kaydet

1. 👤 Proje ana sayfasında web simgesine (`</>`) tıkla.
2. 👤 Takma ad olarak `lifeline-web` yaz ve uygulamayı kaydet.
3. 👤 Ekrandaki `firebaseConfig` değerlerini not al.
4. 👤 Terminalde şablonu kopyala ve değerleri doldur:

   ```bash
   cp .env.example .env.local
   ```

   | `firebaseConfig` alanı | `.env.local` değişkeni |
   | --- | --- |
   | `apiKey` | `VITE_FIREBASE_API_KEY` |
   | `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `VITE_FIREBASE_PROJECT_ID` |
   | `appId` | `VITE_FIREBASE_APP_ID` |

## 3. Firebase AI Logic'i aç

1. 👤 Konsolda **AI Services > AI Logic** yolunu aç ve **Get started** de.
2. 👤 Sağlayıcı olarak **Gemini Developer API** seç. Dokümana göre ücretsiz
   başlanabilir ve Flash modelleri için Blaze planı gerekmez.
3. 👤 Sihirbazı bitir. Sihirbaz gerekli API'leri açar ve App Check'i
   zorunlu kılar.

⚠️ Gemini API anahtarını asla koda veya `.env` dosyasına yazma. Firebase AI Logic
bu anahtarı istemciye vermeden çalışır.

## 4. Geliştirme için App Check debug token'ı

App Check zorunlu olduğu için bu adım olmadan yerel bulut istekleri reddedilir.

1. 👤 Uygulamayı başlat:

   ```bash
   npm run dev
   ```

2. 👤 Tarayıcıda sayfayı aç ve DevTools konsolunu aç (F12).
3. 👤 `AppCheck debug token: ...` satırındaki değeri kopyala.
4. 👤 Konsolda **Security > App Check > Apps** yolunu aç.
5. 👤 Uygulamanın üç nokta menüsünden **Manage debug tokens** seç ve token'ı ekle.
6. 👤 Sayfayı yenile. **Yalnızca bulut** modunda **Gönder** de. ☁️ Bulutta cevabı
   gelmeli.

⚠️ Debug token bir sırdır. Asla commit'leme ve ekran görüntüsünde paylaşma.
Sızarsa aynı menüden hemen sil.

## 5. Yayın için reCAPTCHA Enterprise

Bu adım uygulamayı internete koymadan önce gerekir.

1. 👤 [Google Cloud Fraud Defense sayfasını](https://console.cloud.google.com/security/recaptcha)
   aç. Doğru projede olduğundan emin ol. İstenirse reCAPTCHA Enterprise API'sini
   etkinleştir.
2. 👤 **Web** türünde bir anahtar oluştur. Alan adları:
   `PROJE-ID.web.app` ve `PROJE-ID.firebaseapp.com`.
3. 👤 "Use checkbox challenge" seçeneğini **boş** bırak.
4. ⚠️ `localhost` alanını bu anahtara **ekleme**. Eklersen herkes uygulamanı
   kendi makinesinden çalıştırabilir.
5. 👤 Firebase konsolunda **Security > App Check > Apps** yolunu aç. Web
   uygulamasını reCAPTCHA Enterprise ile kaydet ve anahtarı gir.
6. 👤 Aynı anahtarı `.env.local` içindeki
   `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` alanına yaz.

## 6. Firebase Hosting'e yayınla

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run build
npx firebase-tools deploy --only hosting
```

1. 👤 Bu dört komutu sırayla çalıştır. `use --add` adımında projeni seç.
2. 👤 Komutun verdiği `https://PROJE-ID.web.app` adresini aç.

Service worker, konum ve Prompt API güvenli bağlantı ister. Firebase Hosting
HTTPS'i kendisi sağlar. `localhost` geliştirme için güvenli sayılır.

## Web config neden gizli değil, App Check neden şart?

`firebaseConfig` içindeki `apiKey` bir parola değildir. Yalnızca projeni tanıtır,
bir kimlik kartı gibidir. Web uygulaması tarayıcıda çalıştığı için bu değer zaten
herkesin görebileceği koda gömülür. Firebase'in dokümanı da bu anahtarların koda
konabileceğini
[açıkça söyler](https://firebase.google.com/docs/projects/api-keys).

Ama herkes bu kimlik kartını görebiliyorsa, biri senin projen adına Gemini'ye
istek atıp kotanı tüketebilir. App Check burada devreye girer. Her isteğe
"bu istek gerçekten benim uygulamamdan geliyor" kanıtı ekler ve kanıtı olmayan
istekleri [reddeder](https://firebase.google.com/docs/ai-logic/app-check).

Kısacası kimlik kartı açık kalabilir, kapıdaki güvenlik görevlisi App Check'tir.

Şunlar ise gerçekten gizlidir ve repoya asla girmemelidir:

- Gemini API anahtarı
- App Check debug token'ı
- Servis hesabı JSON dosyaları (`serviceAccount*.json`)
