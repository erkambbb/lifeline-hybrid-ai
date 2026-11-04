# Ders planım

Bu plan projeyi anlamak için gereken kavramları sırayla anlatır. Her kavramda
kısa bir açıklama, projedeki yeri, bir resmi kaynak ve bir alıştırma var.

Kodun içindeki `NEDEN:` yorumları da dersin parçası. Dosyaları okurken onları ara.

Başlamadan önce uygulamayı aç:

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## 1. Git ve GitHub

Git, kodunun her halini fotoğraf gibi saklayan bir geçmiş defteridir. Her
fotoğrafa commit denir ve her commit tarihlidir, bu yüzden jüri geliştirmeyi
ne zaman yaptığını görebilir. GitHub ise bu defterin internetteki kopyasıdır.

- **Projede:** `.gitignore` hangi dosyaların deftere girmeyeceğini söyler.
  `git log --oneline` geçmişi gösterir.
- **Kaynak:** [Pro Git, Türkçe](https://git-scm.com/book/tr/v2)
- **Alıştırma:** `README.md` dosyasına kendi adınla bir satır ekle. Sonra şu
  komutları sırayla çalıştır ve her birinin çıktısını oku:

  ```bash
  git status
  git add README.md
  git commit -m "docs: add my name to README"
  git log --oneline -3
  git push
  ```

## 2. PWA ve service worker

PWA, telefona uygulama gibi kurulabilen bir web sitesidir. Service worker ise
tarayıcı ile internet arasına oturan küçük bir betiktir. Dosyaları önceden
önbelleğe alır, bu yüzden internet kesilince de sayfa açılır.

- **Projede:** `vite.config.ts` içindeki `VitePWA` bölümü. Kayıt işlemi
  `src/main.ts` içindeki `startOfflineSupport` fonksiyonunda.
- **Kaynak:** [web.dev: Learn PWA](https://web.dev/learn/pwa/)
- **Alıştırma:** `npm run build` ve `npm run preview` çalıştır (service worker
  `npm run dev` içinde kapalıdır). Sayfayı aç ve DevTools'ta **Application >
  Service workers** bölümüne bak. **Offline** kutusunu işaretleyip sayfayı
  yenile. Sayfa neden hâlâ açılıyor? **Application > Cache storage** altında
  hangi dosyaları görüyorsun?

## 3. Firebase nedir?

Firebase, Google'ın uygulama geliştiricilere verdiği hazır arka uç hizmetleri
paketidir. Kendi sunucunu kurmak yerine barındırma, veritabanı ve yapay zekâ
gibi parçaları hazır kullanırsın. Biz şimdilik Hosting, AI Logic ve App Check
kullanıyoruz.

- **Projede:** `src/firebase.ts` bağlantıyı kurar. `firebase.json` barındırma
  ayarıdır. Kurulum adımları `docs/FIREBASE_SETUP.md` içinde.
- **Kaynak:** [Firebase'i web projesine ekleme](https://firebase.google.com/docs/web/setup)
- **Alıştırma:** `docs/FIREBASE_SETUP.md` içindeki 1-4. adımları bitir. Sayfadaki
  **Firebase** satırı "Configured" olmalı.

## 4. Firebase AI Logic

Firebase AI Logic, uygulamanın Gemini modellerini doğrudan çağırmasını sağlayan
SDK'dır. Kendi sunucunu yazman gerekmez ve Gemini API anahtarın istemciye inmez.
Hibrit çıkarım da bu SDK'nın bir özelliğidir.

- **Projede:** `src/hybrid.ts` içindeki `getAI` ve `getGenerativeModel`.
- **Kaynak:** [Firebase AI Logic dokümanı](https://firebase.google.com/docs/ai-logic)
- **Alıştırma:** `src/hybrid.ts` içinde `CLOUD_MODEL` değerini
  `gemini-3.5-flash-lite` yap. `ONLY_IN_CLOUD` modunda aynı prompt'u gönder.
  Cevap süresini ve üslubu önceki modelle karşılaştır, sonra değeri geri al.

## 5. On-device ve cloud AI

Cloud AI, sorunu Google'ın güçlü sunucularındaki büyük modele gönderir, bu yüzden
daha akıllıdır ama internet ister. On-device AI, küçük bir modeli kendi cihazında
çalıştırır. İnternet istemez ve verin cihazdan çıkmaz, ama daha sınırlıdır ve
güçlü donanım ister.

- **Projede:** `src/hybrid.ts` içindeki `getDeviceStatus` ve `DeviceStatus` türü.
  Gerçek sınırlar `docs/RESEARCH.md`, bölüm 2'de.
- **Kaynak:** [Chrome built-in AI](https://developer.chrome.com/docs/ai/built-in)
- **Alıştırma:** Önce X-Plane ve Steam gibi ekran kartı kullanan uygulamaları kapat.
  Sayfadaki **Download on-device model** düğmesiyle modeli indir.
  `chrome://on-device-internals` adresini aç ve modelin durumunu incele. Sonra
  sayfayı telefonunda aç. **On-device model** satırı ne diyor, neden?

## 6. Hibrit çıkarım

Hibrit çıkarım, her istek için modelin cihazda mı bulutta mı çalışacağına SDK'nın
karar vermesidir. Sen yalnızca bir mod seçersin. Cevap gelince
`response.inferenceSource` değeri kaynağı söyler.

- **Projede:** `src/hybrid.ts` içindeki `createModel` ve `ask`. Rozetler
  `src/main.ts` içindeki `SOURCE_LABELS` nesnesinde.
- **Kaynak:** [Web'de hibrit deneyim](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- **Alıştırma:** Demo sayfasındaki prompt'u değiştir. Dört modu önce çevrimiçi
  dene, sonra Wi-Fi'yi kapatıp tekrar dene. Her biri için sonucu şu tabloya yaz:

  | Mod | Çevrimiçi | Çevrimdışı |
  | --- | --- | --- |
  | `PREFER_ON_DEVICE` | | |
  | `PREFER_IN_CLOUD` | | |
  | `ONLY_ON_DEVICE` | | |
  | `ONLY_IN_CLOUD` | | |

  Afet uygulaması için neden `PREFER_ON_DEVICE` seçtik? İpucu: `docs/RESEARCH.md`,
  bölüm 1.

## 7. Prompt tasarımı ve grounding

Prompt, modele verdiğin talimattır. Grounding ise modeli uydurmak yerine verdiğin
kaynaklara bağlamaktır. Biz bir adım ileri gidiyoruz: model talimat yazmıyor,
yalnızca insanların hazırladığı bilgi kartlarından birini seçiyor. Böylece
sağlık talimatını model uyduramaz.

- **Projede:** Hafta 1'de yazılacak. Mimari `docs/RESEARCH.md`, "Önerilen mimari"
  bölümünde. Dil sınırı `src/hybrid.ts` içindeki `ON_DEVICE_LANGUAGE`.
- **Kaynak:** [Gemini prompt stratejileri](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- **Alıştırma:** `ONLY_ON_DEVICE` modunda iki prompt'u karşılaştır:

  1. `How do I treat a burn?`
  2. `You may only answer with one of these words: bleeding, rubble, gas, other. Situation: my arm is bleeding.`

  İlkinde model hangi bilgileri kendi üretti, doğruluğundan emin olabilir misin?
  İkincisi neden daha güvenli? Sonra Türkçe bir cümle dene ve sonucu not et.

## 8. App Check

Web config herkese açıktır, bu yüzden biri senin projen adına istek atabilir.
App Check her isteğe "bu istek gerçekten benim uygulamamdan geliyor" kanıtı ekler.
Kanıtı olmayan istekleri Firebase reddeder.

- **Projede:** `src/firebase.ts` içindeki `setUpAppCheck`. Neden gerektiği
  `docs/FIREBASE_SETUP.md` sonunda.
- **Kaynak:** [Firebase App Check](https://firebase.google.com/docs/app-check)
- **Alıştırma:** Debug token'ı kaydettikten sonra `ONLY_IN_CLOUD` modunda istek
  gönder. Sonra konsoldan token'ı geçici olarak sil ve tekrar dene. Hata mesajını
  oku. Token'ı geri ekle. Konsolun **Security > App Check** bölümündeki doğrulanmış
  ve doğrulanmamış istek sayılarına bak.

## Sırada ne var?

Bu sekiz dersi bitirince `docs/ROADMAP.md` içindeki Hafta 1 görevlerine hazırsın.
