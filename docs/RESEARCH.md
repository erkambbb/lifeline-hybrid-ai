# Araştırma raporu

Tarih: 4 Kasım 2026. Bu API'ler hızlı değişiyor, kararlar 9 Kasım'da yeniden
kontrol edilmeli.

Her bilginin dayanağını belirttim:

- **[Doküman]**: resmi doküman, link verildi.
- **[SDK]**: `firebase@13.2.0` kaynak kodunu okudum.
- **[Test]**: bu makinede gerçekten denedim.
- **[Zayıf]**: eski veya resmi olmayan kaynak, gerçek cihazda test şart.

## Özet: kritik soruların cevabı

1. **Gemini Nano telefonda web üzerinden çalışmıyor.** Chrome'un Prompt API'si
   yalnızca masaüstünde var. Android ve iOS desteklenmiyor. [Doküman]
2. **Türkçe desteklenmiyor.** Prompt API `en`, `ja`, `es`, `de`, `fr` kabul ediyor.
   Bu makinede `tr` için `unavailable` döndü. [Doküman, Test]
3. **Doküman, model indikten sonra çevrimdışı çalıştığını söylüyor.** Bunu bu
   makinede uçtan uca kanıtlayamadım: VRAM dolu olduğu için model yüklenemedi.
   Bölüm 8'deki son adım hâlâ yapılmalı. [Doküman]
4. **Android native yol var ama çözüm değil.** Yalnızca belirli üst seviye
   telefonlarda çalışıyor. Doğrulanmış diller İngilizce ve Korece. [Doküman]

**Öneri:** PWA'da kal, üç katmanlı tasarım kullan (bölüm 2 sonu). Model talimat
yazmaz, doğrulanmış bilgi kartı seçer. Modelsiz cihazlarda çevrimdışı yerel arama
devreye girer.

## 1. Firebase AI Logic hibrit çıkarım (web)

**Kurulum.** `npm install firebase`, sonra `firebase/ai` içinden `getAI`,
`getGenerativeModel`, `GoogleAIBackend` ve `InferenceMode` kullanılır.
[Doküman](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

**Modlar:**

| Mod | Davranış |
| --- | --- |
| `PREFER_ON_DEVICE` | Cihaz modeli hazırsa onu kullanır, değilse buluta gider |
| `ONLY_ON_DEVICE` | Yalnızca cihaz, değilse hata verir |
| `PREFER_IN_CLOUD` | Önce bulut, başarısız olursa cihaz |
| `ONLY_IN_CLOUD` | Yalnızca bulut, değilse hata verir |

**Cevabın kaynağı.** `result.response.inferenceSource` değeri cevabın nereden
geldiğini söyler. Dokümandaki değerler `ON_DEVICE` ve `IN_CLOUD`, JS SDK v12.5.0
ve sonrası gerekir.
[Doküman](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
Bu değerler kodda `on_device` ve `in_cloud` dizgeleridir. [SDK]

**Örnek kod:**

```ts
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  inCloudParams: { model: "gemini-3.8-flash" },
  onDeviceParams: {
    createOptions: {
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    },
  },
});

// Kullanıcı tıklamasından sonra çağrılmalıdır.
await model.initializeDeviceModel((p) => console.log(p));

const result = await model.generateContent("Hello");
console.log(result.response.inferenceSource, result.response.text());
```

**Cihazdaki modelin sınırları**
([Doküman](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)):

- Tek turlu metin üretimi. Çok turlu sohbet yok.
- Araç yok: function calling, Google Search grounding yok.
- En fazla 9216 token. Tüm bilgi tabanını prompt'a koyamayız.
- `countTokens` hata verir. Firebase izleme ekranı cihaz çağrılarını göstermez.
- Yapılandırılmış çıktı (JSON ve enum) var.
  [Doküman](https://firebase.google.com/docs/ai-logic/hybrid/web/generate-structured-output)

**Bulut modeli.** Örneklerde `gemini-3.8-flash` kullanılıyor. Varsayılan bulut
modeli `gemini-3.5-flash-lite`. Flash modelleri Gemini Developer API ile Blaze
planı gerektirmiyor.
[Doküman](https://firebase.google.com/docs/ai-logic/models)

**SDK kodundan ve testten çıkan, dokümanda olmayan dört sonuç [SDK, Test]:**

1. **Zaman aşımı 180 saniyedir.** Tıkalı ağda kullanıcı 3 dakika bekleyebilir. Bu
   yüzden `src/hybrid.ts` bunu 10 saniyeye indiriyor.
2. **`PREFER_IN_CLOUD` zaman aşımında cihaza geçmez.** Geçiş yalnızca `AIError`
   türündeki `FETCH_ERROR`, `ERROR` ve `API_NOT_ENABLED` hatalarında olur. Zaman
   aşımı ise `AbortError` olarak kalır. Yani ağ tamamen kopuksa geçer, tıkalıysa
   geçmez. Depremde ağ çoğu zaman tıkalıdır.
3. **`PREFER_ON_DEVICE`, model yoksa ve ağ da yoksa hata fırlatır.** Uygulama bu
   hatayı yakalayıp yerel aramaya düşmelidir.
4. **Cihaz oturumu çökerse SDK buluta geçmez.** `availability()` değeri
   `available` olsa bile `create()` hata verebilir. Bu durumda
   `PREFER_ON_DEVICE` hatayı olduğu gibi fırlatır. Bunu testte gördüm (bölüm 8).
   Uygulama kendi yedek zincirini kurmalıdır: cihaz, sonra bulut, sonra yerel arama.

**Karar:** Varsayılan mod `PREFER_ON_DEVICE`. Ağın durumuna hiç bakmadan çalışır.
Bulut, modeli olmayan cihazların yolu olur.

## 2. KRİTİK: Gemini Nano nerede çalışıyor?

### Web (Chrome Prompt API)

Firebase AI Logic'in web hibrit modu bu API'yi kullanır.
"On-device inference" Firebase dokümanında da yalnızca masaüstü Chrome için
geçer.
[Doküman](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)

| Platform | Durum |
| --- | --- |
| Chrome: Windows 10/11, macOS 13+, Linux | ✅ Destekleniyor |
| ChromeOS, yalnızca Chromebook Plus | ✅ Destekleniyor |
| Chrome for Android | ❌ "not yet supported" |
| iOS | ❌ "not yet supported" |

**Donanım** ([Doküman](https://developer.chrome.com/docs/ai/prompt-api)):

- Chrome profilinin olduğu diskte en az 22 GB boş alan
- GPU ile: 4 GB'tan fazla VRAM
- CPU ile: 16 GB RAM ve 4 çekirdek
- İlk indirme için sınırsız veya ölçümsüz bağlantı

Boş alan 10 GB'ın altına düşerse model silinir.
[Doküman](https://developer.chrome.com/docs/ai/get-started)
Bu, afet uygulaması için gerçek bir risktir.

**İndirme.** `LanguageModel.availability()` modelin durumunu söyler. İndirme
kullanıcı tıklamasıyla başlar. Bu yüzden kurulum akışında "Çevrimdışı modeli
indir" adımı şarttır.
[Doküman](https://developer.chrome.com/docs/ai/get-started)

**Çevrimdışı.** Doküman "Subsequent use of the model does not require a network
connection" diyor.
[Doküman](https://developer.chrome.com/docs/ai/prompt-api)

**Sürüm farkı.** Firebase dokümanı Chrome 139 ve bir flag'den bahsediyor. Chrome
dokümanı ise web için Chrome 148 diyor. Bu makinede Chrome 157'de metin için flag
gerekmedi. [Test]

### Türkçe

Prompt API yalnızca `en`, `ja`, `es`, `de`, `fr` kabul ediyor, diğer diller
"geliştirme aşamasında".
[Doküman](https://developer.chrome.com/docs/ai/prompt-api)

Bu makinede Chrome 157 ile ölçtüm [Test]:

| Çağrı | Sonuç |
| --- | --- |
| `LanguageModel.availability` (`en`) | `downloadable` |
| `LanguageModel.availability` (`de`) | `downloadable` |
| `LanguageModel.availability` (`tr`) | `unavailable` |
| `LanguageModel.availability` (girdi `tr`, çıktı `en`) | `unavailable` |
| `Translator.availability` (`tr → en`) | `downloadable` |

Sinsi tuzak: `languages: ["tr"]` yazarsak `PREFER_ON_DEVICE` hata vermez, sessizce
buluta gider. Çevrimdışıyken de çöker. [SDK]

Çözüm: Chrome'un
[Translator API'si](https://developer.chrome.com/docs/ai/translator-api) Türkçeyi
destekliyor ve masaüstünde çalışıyor. Türkçe metin önce İngilizceye çevrilir,
Nano İngilizce çalışır, kullanıcı önceden yazılmış Türkçe kartı görür.
Translator'ın çevrimdışı davranışı dokümanda açıkça yazmıyor, Hafta 1'de test
edilecek.

### Android native (AICore)

Android'de Gemini Nano, AICore sistem servisiyle çalışır ve Firebase AI Logic'in
Android hibrit API'si vardır.
[Doküman](https://firebase.google.com/docs/ai-logic/hybrid/android/get-started)

- Durum: deneysel. ML Kit Prompt API beta.
- Cihazlar: Pixel 9/10/11, Galaxy S26, Z Fold7/8, OnePlus 13, bazı Xiaomi, OPPO,
  vivo ve Honor modelleri.
  [Doküman](https://developers.google.com/ml-kit/genai)
- Diller: yalnızca İngilizce ve Korece doğrulanmış.
- Limit: istek başına 4000 token, çıktı için yaklaşık 256 token önerisi.
- Yalnızca uygulama ön plandayken çalışır. Kota ve pil sınırı var.
- Kaynak tespiti web ile aynı: `result.response.inferenceSource`.

### Seçenekler

| | A. PWA, üç katman | B. Android native | C. İkisi birden |
| --- | --- | --- | --- |
| Telefonda çevrimdışı AI | ❌ (yerel arama var) | ✅ yalnızca üst seviye cihaz | ✅ aynı |
| Telefonda çevrimdışı yardım | ✅ tüm telefonlar | ⚠️ yalnızca uygulama kuranlar | ✅ |
| iPhone | ✅ | ❌ | ✅ |
| Türkçe | ⚠️ çeviri köprüsü | ⚠️ çeviri gerekir | ⚠️ |
| Öğrenme yükü | Düşük | Yüksek (Kotlin, Android) | Çok yüksek |
| Test için özel telefon | Gerekmez | **Gerekir** | Gerekir |
| 3 haftada biter mi? | Evet | Riskli | Hayır |

### Önerim: A

Nano çalıştıran telefonlar üst seviye modellerden oluşan kısa bir liste. B seçeneği
bu listenin dışındaki telefonlara AI getirmez ve iPhone'u tamamen dışarıda bırakır.
A seçeneğinde herkes çevrimdışı yardım alır, AI ise uygun cihazda güçlenir. Bu,
ilerleyici geliştirmedir.

Dürüst konumlandırma cümlesi: "Yardım her cihazda çalışır. Yapay zekâ, cihazın
izin verdiği en iyi seviyede çalışır."

Şu durumda yeniden değerlendirelim: Elinde desteklenen bir telefon varsa ve 9
Kasım kuralları Android'i ödüllendiriyorsa, küçük bir Android demosu bonus
olabilir.

### Önerilen mimari

```text
Kullanıcı metni (Türkçe)
        │
        ├─ Katman 1 ☁️ Bulut (Gemini Flash): Türkçe metni doğrudan anlar
        ├─ Katman 2 📱 Cihaz (Nano): Translator tr→en, sonra Nano
        └─ Katman 3 📚 Yerel arama: model yok, ağ yok, Türkçe anahtar kelime
        │
        ▼
Kart kimliği (enum çıktı)  →  Önceden yazılmış, kaynaklı kart + 112 uyarısı
```

Bu tasarımın üç faydası var:

- **Uydurma riski düşer.** Model metin yazmaz, enum listesinden seçer.
  `Schema.enumString` ve `responseConstraint` iki yolda da çalışır.
- **Türkçe sorunu küçülür.** Model yalnızca anlama işini yapar, çıktı metni
  insanların yazdığı karttır.
- **9216 token sınırı sorun olmaz.** Prompt'a yalnızca kart başlıkları girer.

## 3. PWA çevrimdışı çalışma

**Araç.** `vite-plugin-pwa` manifesti ve service worker'ı üretir, Workbox kullanır.
[Doküman](https://vite-pwa-org.netlify.app/guide/)

**Strateji**
([Doküman](https://developer.chrome.com/docs/workbox/caching-strategies-overview)):

| Kaynak | Strateji | Neden |
| --- | --- | --- |
| Uygulama kabuğu, JS, CSS, ikonlar | Precache | Kurulumda iner, kriz anında hazırdır |
| Bilgi tabanı JSON | Precache | Asla ağa bağımlı olmamalı |
| Bulut AI istekleri | Network only | Önbelleğe alınmaz, SDK yönetir |

**Depolama.** Veriler varsayılan olarak "best effort" saklanır ve disk dolunca
silinebilir. `navigator.storage.persist()` bunu önler.
Safari'nin 7 günlük silme kuralı ana ekrana eklenmiş PWA'lara uygulanmaz, ama bu
PWA'nın depolaması Safari'den ayrıdır.
[Doküman](https://web.dev/articles/storage-for-the-web)

Sonuç: iPhone kullanıcısına "Ana Ekrana Ekle" adımını özellikle anlatmalıyız.

## 4. Konum ve SMS

### Geolocation

- Güvenli bağlantı (HTTPS) ve kullanıcı izni gerekir. `timeout` varsayılanı
  sonsuzdur, mutlaka vermeliyiz.
  [Doküman](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition)
- GPS alıcısı internet istemez, ama tarayıcının çevrimdışı davranışı için güncel
  resmi kaynak bulamadım. Bir
  [2014 tarihli Chromium tartışması](https://groups.google.com/a/chromium.org/g/chromium-html5/c/iAZgjSJTf3o)
  masaüstü Chrome'un internetsiz konum vermediğini söylüyor. [Zayıf]

Tasarım kararları:

- `enableHighAccuracy: true`, `timeout` yaklaşık 20 saniye.
- `maximumAge` birkaç dakika olsun ki son bilinen konum kabul edilsin.
- Konum izni hazırlık modunda önceden istensin. Panik anında izin penceresi olmaz.
- Konum alınamazsa kullanıcı adresi elle yazabilsin.
- Gerçek telefonda uçak modunda test edilecek (Hafta 3).

### `sms:` URI

- Standart biçim `sms:+905551112233?body=METIN`. `body` yüzde kodlu UTF-8 olur.
  Bağlantı mesajı yalnızca hazırlar, kullanıcı onaylamadan gönderilmez.
  [RFC 5724](https://www.rfc-editor.org/rfc/rfc5724.txt)
- iOS ve Android ayırıcı konusunda farklı davranıyor. Yaygın öneri iOS için
  `&body=`, Android için `?body=`. Bazı Android mesaj uygulamaları `body` değerini
  yok sayabiliyor. Apple veya Google'dan resmi kaynak bulamadım.
  [Zayıf](https://github.com/weroro-sk/sms-href)

Tasarım kararları:

- Kullanıcı aracısına göre ayırıcı seçilir ve gerçek cihazlarda test edilir.
- Yedek olarak "Metni kopyala" düğmesi her zaman bulunur.
- Alıcılar hazırlık modunda kaydedilen aile kişileridir. 112'nin SMS kabul edip
  etmediğini doğrulayamadım, o yüzden hedef olarak kullanmıyoruz.

**SMS uzunluğu.** GSM-7 ile 160, Unicode ile 70 karakter sığar.
[Doküman](https://www.infobip.com/docs/essentials/national-language-shift)
Türkçe için özel kodlama tabloları var ama her operatörde garanti değil. Bu yüzden
mesajı `ş→s`, `ğ→g`, `ı→i` dönüşümüyle ASCII'ye çevirip 160 karakterin altında
tutmak en güvenlisi.

**Temel sınır.** SMS için de şebeke gerekir. Baz istasyonu yoksa mesaj gitmez.
Özellik "sinyal döndüğü an gönderilmeye hazır mesaj" olarak sunulmalıdır.

## 5. Firebase App Check

**Neden şart.** AI Logic için App Check artık zorunlu. Yeni kurulumlarda konsol
sihirbazı bunu otomatik açar. Mevcut projeler için zorunluluk 2 Kasım 2026'da
başladı.
[Doküman](https://firebase.google.com/docs/ai-logic/app-check)

**Geliştirmede.** `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` ayarı App Check
başlamadan önce yapılır. Konsola düşen token Firebase'e kaydedilir. Token sır
sayılır, commit'lenmez.
[Doküman](https://firebase.google.com/docs/app-check/web/debug-provider)

**Yayında.** Web için reCAPTCHA Enterprise gerekir. Web türünde, skor tabanlı bir
anahtar oluşturulur ve `localhost` asla eklenmez. Token ömrü 30 dakika ile 7 gün
arasındadır, varsayılan 1 saattir. Ücretsiz kotanın üstü faturalanır.
[Doküman](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)

**Çevrimdışı.** App Check token'ı yalnızca bulut isteğinde alınır. Cihaz yolu
ağa çıkmaz. [SDK]

**Web config neden açık olabilir?** Firebase API anahtarları projeyi tanıtır,
yetki vermez. Gemini API anahtarı ise asla koda girmez.
[Doküman](https://firebase.google.com/docs/projects/api-keys)
Ayrıntılı anlatım: `docs/FIREBASE_SETUP.md`.

## 6. İçerik kaynakları ve lisans

Hukuki danışmanlık değildir. Telif durumunu yalnızca bulabildiğim kadarıyla yazdım.

| Kaynak | Kullanım durumu | Durum |
| --- | --- | --- |
| [IFRC First Aid Guidelines 2020](https://www.ifrc.org/document/international-first-aid-resuscitation-and-education-guidelines) | Kaynak gösterilerek, ticari olmayan kullanım için kopyalanabilir | PDF künyesinde okudum |
| AFAD | Bulunamadı | afad.gov.tr bu ortamdan HTTP 500 verdi, koşullar doğrulanamadı |
| Türk Kızılay | Açık lisans bulamadım | Tüm hakları saklı varsay |
| [FEMA](https://www.fema.gov/about/website-information) | Çoğu içerik telifsiz, fotoğraflarda istisna var | Arama sonucundan, sayfa 403 verdi |
| [WHO](https://www.who.int/about/policies/publishing/copyright) | CC BY-NC-SA 3.0 IGO | Sayfada okudum |

Dikkat: [IFRC First Aid uygulaması](https://preparecenter.org/resource/frequently-asked-questions-universal-app-program-first-aid/universal_app_program_faqs)
ayrı bir lisans programıdır, içeriği serbest değildir.

**Plan:**

1. Ana temel IFRC 2020 kılavuzu olsun. Lisansı en net kaynak o.
2. Metinleri kopyalama, kendi cümlelerimizle kısa adımlara dönüştür ve kaynağı göster.
3. Yerel doğruluk için AFAD ve Kızılay'ı referans al.
4. 👤 AFAD ve Kızılay'a e-posta ile izin sor. IFRC kullanım bilgisi de ister:
   `secretariat@ifrc.org`.
5. Kızılhaç ve Kızılay amblemlerini kullanma. Bu amblemler hukuken korumalıdır.
6. Kod MIT kalır. Bilgi tabanı IFRC'nin ticari olmayan şartı nedeniyle MIT
   kapsamına alınmaz, ayrı lisans notu taşır.

**Tıbbi güvenlik.** Kartları teslimden önce sağlık eğitimi olan biri gözden
geçirmeli. Her kartta 112 uyarısı ve "profesyonel yardımın yerini tutmaz" notu
bulunmalı.

## 7. Teknoloji yığını

| Parça | Seçim | Neden |
| --- | --- | --- |
| Derleme | Vite 8.3.5 | Hızlı, az ayar, PWA eklentisi hazır |
| Dil | TypeScript 7.0.2 | Hataları yazarken yakalar, SDK türleri öğretici |
| Arayüz | Çerçeve yok | Tek seferde bir kavram öğrenilir, paket küçük kalır |
| PWA | vite-plugin-pwa 2.0.0 | Service worker'ı elle yazmayı önler |
| AI | firebase 13.2.0 | Yarışmanın konusu |
| Barındırma | Firebase Hosting | Ücretsiz HTTPS, tek ekosistem |

React veya Next.js eklemedim. Üç küçük ekran için öğrenme yükü getirir, Next.js'in
sunucu tarafı özellikleri de çevrimdışı PWA'da işe yaramaz. Arayüz büyürse Preact
sonradan eklenebilir.

`npm audit`, Firestore'un kullandığı `@grpc/grpc-js` için uyarı veriyor. Firestore
kullanmıyoruz ve bu kod pakete girmiyor. Önerilen `--force` düzeltmesi Firebase'i
9.x sürümüne düşürür, bu yüzden uygulamadım.

## 8. Bu makinede yapılan testler

Ortam: Linux, Chrome 157, RTX 4050 (6 GB VRAM), 15 GB RAM.

Firebase projesi henüz yok, bu yüzden bulut yolu test edilmedi. Testler Chrome
DevTools protokolüyle, üretim derlemesi üzerinde ve geçici bir profille yapıldı.

| Test | Sonuç |
| --- | --- |
| Service worker kurulumu | ✅ |
| Ağ kapalıyken sayfayı yeniden yükleme | ✅ Uygulama açıldı |
| Model indirme düğmesi | ✅ İndi, yaklaşık 12,5 dakika, profil 4,2 GB |
| `availability()` indirmeden sonra | ✅ `available` (`v3Nano`, GPU sürümü) |
| Cihazda cevap üretme | ❌ `InvalidStateError` |
| Çevrimdışı, model de çalışmıyorken `PREFER_ON_DEVICE` | Beklendiği gibi hata (`Failed to fetch`) |
| `VITE_APPCHECK_DEBUG_TOKEN` üretim paketine sızıyor mu? | ✅ Sızmıyor (bölüm sonuna bak) |

**`InvalidStateError` nedeni.** Chrome günlüğünde şu satır var:

```text
Terminating On-Device Model Service: Out of memory:
vkAllocateMemory failed with VK_ERROR_OUT_OF_DEVICE_MEMORY
```

Chrome doğru ekran kartını seçti (RTX 4050, Vulkan). Ama test anında 6 GB VRAM'in
yaklaşık 3,9 GB'ı başka uygulamalardaydı (X-Plane, Steam, Unity Hub, tarayıcılar).
Yani hata kodda değil, boş bellekte. Görünür pencerede de aynı hata tekrarlandı.

Çıkan ders: Chrome'un ">4 GB VRAM" şartı toplam belleği ölçer, boş belleği değil.
`availability()` bu yüzden `available` diyebilir ama model yüklenemez. Gerçek
kullanıcıda da bu olabilir ve yedek zinciri bu yüzden şarttır.

**Yapılması gereken son test.** 👤 X-Plane, Steam ve Unity Hub'ı kapat. Sonra kendi
Chrome'unda demo sayfasını aç, modeli indir, Wi-Fi'yi kapat ve `ONLY_ON_DEVICE`
modunda **Send** de. 📱 On-device rozetini görürsek projenin ana varsayımı bu
makinede kanıtlanmış olur.

**Sızıntı testi.** İlk sürümde `const env = import.meta.env` kısaltması kullandım.
Vite bu durumda tüm `VITE_` değerlerini paketin içine gömüyor. Bu yüzden her
değişkene tam adıyla erişecek şekilde düzelttim. Sahte bir token ile yaptığım
derlemede token pakette çıkmadı.

## 9. Yarışma sayfasından notlar

[Devpost sayfası](https://firebasehybridaihackathon.devpost.com/), 4 Kasım itibarıyla:

- Tam kurallar 9 Kasım'da yayınlanacak, **Rules** sekmesi henüz boş.
- Büyük ödül 30.000 dolar, tek kazanan. Kayıtlı 571 katılımcı var.
- **Dördüncü jüri kriteri var:** "Quality of the Idea". Yaratıcı, bariz olmayan
  kullanım ve problem alanını gerçekten anlamak isteniyor.
- Kategoriler arasında Mobile ve Web geçiyor.

## 10. Riskler

| Risk | Etki | Önlem |
| --- | --- | --- |
| Jüri telefonda on-device AI bekler | Yüksek | Dürüst konumlandırma, üç katman, demoda laptop ve telefon |
| Nano Türkçe bilmiyor | Yüksek | Translator köprüsü, enum seçimi, Türkçe kartlar |
| Translator çevrimdışı çalışmayabilir | Orta | Hafta 1'in ilk testi. Olmazsa Türkçe yerel aramaya düşer |
| Küçük model yanlış kart seçer | Yüksek | Doğruluk ölçümü, "emin değilim" kartı, kullanıcı tüm kartları görebilir |
| Tıbbi içerik hatası | Yüksek | Sağlıkçı incelemesi, 112 uyarısı |
| API'ler deneysel ve değişebilir | Orta | Sürümler sabitlendi, tek dosyada (`src/hybrid.ts`) |
| İçerik izni gelmez | Orta | IFRC temelli, kendi cümlelerimiz |
| `sms:` veya GPS cihaza göre bozulur | Orta | Kopyala düğmesi, elle adres, gerçek cihaz testi |
| Yeni geliştirme kuralı | Yüksek | 9 Kasım öncesi yalnızca iskelet, tarihli commit'ler |
| VRAM doluyken model yüklenemez | Yüksek | Yedek zinciri, demo öncesi ağır uygulamaları kapat |

## Kaynaklar

- [Firebase: hibrit web başlangıç](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started)
- [Firebase: hibrit web ayarları](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options)
- [Firebase: hibrit Android başlangıç](https://firebase.google.com/docs/ai-logic/hybrid/android/get-started)
- [Firebase: hibrit Android ayarları](https://firebase.google.com/docs/ai-logic/hybrid/android/configuration-options)
- [Firebase: AI Logic ve App Check](https://firebase.google.com/docs/ai-logic/app-check)
- [Chrome: Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Chrome: built-in AI başlangıç](https://developer.chrome.com/docs/ai/get-started)
- [Chrome: Hybrid AI prompting](https://developer.chrome.com/docs/ai/firebase-ai-logic)
- [Android: Gemini Nano](https://developer.android.com/ai/gemini-nano)
- [ML Kit GenAI](https://developers.google.com/ml-kit/genai)
