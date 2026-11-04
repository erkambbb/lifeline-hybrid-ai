# Yol haritası: 9-30 Kasım 2026

| Olay | Türkiye saati |
| --- | --- |
| Teslim açılır, kurallar yayınlanır | 9 Kasım Pazartesi, 19:00 |
| **Teslim kapanır** | **1 Aralık Salı, 01:00** |
| Jüri | 9-17 Aralık |
| Kazananlar | 22 Aralık, 01:00 |

Hedefimiz 29 Kasım akşamı teslim etmek. Yarışmaya her şey İngilizce gönderilir.

## Durum (4 Kasım)

Plan değişti: ana özellikler 9 Kasım'ı beklemeden yazıldı.

⚠️ **Kural riski.** Yarışma, teslim döneminde önemli yeni geliştirme şartı koyuyor.
Bu commit'ler 9 Kasım'dan önce tarihli. Kurallar çıkınca ilk iş bunu kontrol et. Teslim
metninde 9 Kasım öncesi ve sonrası yapılanları açıkça ayır.

**Bitti:**

- [x] Fikir, araştırma, repo, ders planı, otomatik derleme
- [x] Türkçe ve İngilizce arayüz, Türkçe adıyla Can Hattı
- [x] 15 kaynaklı bilgi kartı, modelsiz çevrimdışı arama
- [x] Hibrit kart seçimi ve yedek zinciri (cihaz, bulut, yerel arama)
- [x] Yardım mesajı: bilgi çıkarma, konum, `sms:` bağlantısı
- [x] Hazırlık: çevrimdışı hazırlık, afet çantası, aile planı
- [x] Devpost taslağı ve izin e-postası taslakları

**Yapılmadı, sana bağlı:**

- [ ] Devpost'ta **Join hackathon**
- [ ] Firebase kurulumu (`docs/FIREBASE_SETUP.md`)
- [ ] Kart seçiminin gerçek modelle testi: ağır uygulamaları kapat
- [ ] Kurumlara izin e-postası at (`docs/OUTREACH.md`)
- [ ] Kartları sağlık eğitimli birine incelet
- [ ] `docs/LEARNING.md` derslerine başla

## 9 Kasım kontrol listesi

Kurallar bu gün yayınlanıyor. Kod yazmadan önce oku.

- [ ] Türkiye katılabilen ülkeler arasında mı? Katılım ücreti var mı?
- [ ] Var olan projeler ve "önemli yeni geliştirme" şartı ne diyor?
- [ ] Yapay zekâ destekli geliştirmeye dair kural var mı?
- [ ] Zorunlu teslim öğeleri neler (video süresi, canlı URL, repo)?
- [ ] Bonus görevler neler?
- [ ] Yalnız web mi kabul ediliyor, Android da sayılıyor mu?
- [ ] Jüri kriterleri değişti mi? Şu an dört kriter var: Technological
      Implementation, Design, Potential Impact, Quality of the Idea.

## Hafta 1 (9-15 Kasım): gerçek modelle doğrulama

Amaç: yazılan hibrit yolu gerçek cihaz ve bulutla kanıtlamak, teslim dönemi işlerini
başlatmak.

- [ ] Cihaz ve bulutta kart seçimi, enum ve JSON çıktısı testi
- [ ] İlk kurulum akışı: yeni kullanıcıyı Hazırlık sekmesine yönlendirme
- [ ] Bonus görevler çıktıysa planı onlara göre değiştir
- [ ] Ağ durumuna göre daha akıllı yönlendirme denemesi

## Hafta 2 (16-22 Kasım): bilgi tabanı ve cila

Amaç: içerik güvenilir olsun, ürün bütünlüklü görünsün.

- [ ] Sağlıkçı incelemesinden gelen düzeltmeler, inceleme uyarısının kaldırılması
- [ ] Yangın gibi eksik konular için kaynaklı yeni kartlar
- [ ] Yerel aramaya gerçek kullanıcı cümleleriyle yeni sözcükler
- [ ] Erişilebilirlik kontrolü

## Hafta 3 (23-30 Kasım): test, video, Devpost

Amaç: gerçek cihazlarda doğrula ve teslim et.

- [ ] Gerçek Android ve iPhone: kurulum, çevrimdışı açılış, `sms:`, GPS
- [ ] Uçak modu ve zayıf ağ testleri
- [ ] 10 örnek senaryoyla kart seçimi doğruluğu ölçümü ("bacağım sıkıştı" gibi
      çeviri tuzakları dahil)
- [ ] Firebase Hosting'e yayın ve App Check metriklerinin kontrolü
- [ ] Demo videosu çekimi (aşağıda)
- [ ] Devpost sayfası ve ekran görüntüleri (`docs/SUBMISSION.md`)
- [ ] Jüri bağlantısı `?lang=en` ile temiz tarayıcıda deneme
- [ ] 29 Kasım akşamı teslim, 30 Kasım'ı yedek bırak

## Demo videosu (3 dakikanın altında, hedef 2:45)

Videonun merkezi "interneti kes, uygulama çalışmaya devam ediyor" anıdır.

| Süre | Sahne | Mesaj |
| --- | --- | --- |
| 0:00-0:25 | 6 Şubat 2023 verileri, baz istasyonları düştü | Yardım en çok gerektiğinde ağ gider |
| 0:25-0:50 | Uygulama çevrimiçi, ☁️ Bulutta cevabı | Normalde en iyi model çalışır |
| 0:50-1:50 | **Wi-Fi'yi ekranda kapat**, aynı soruyu sor, 📱 Cihazda | **Merkez an: uygulama durmuyor** |
| 1:50-2:15 | Telefonda uçak modu, 📚 Çevrimdışı kütüphane | Modelsiz telefon bile cevapsız kalmıyor |
| 2:15-2:35 | Yardım mesajı, hazır SMS | Sinyal dönünce tek dokunuş |
| 2:35-2:45 | Mimari ve kapanış | Tek uygulama, üç katman, açık kaynaklar |

Çekim notları:

- İnterneti gerçek hayatta kes, sadece DevTools ile taklit etme. Wi-Fi simgesi
  görünsün.
- Kesintisiz tek çekim yap ki kurgu şüphesi olmasın.
- Çekimden önce X-Plane, Steam ve Unity Hub gibi ağır uygulamaları kapat. Boş
  VRAM yoksa model yüklenemez.
- Videoyu `?lang=en` ile çek ve İngilizce anlat. Metin: `docs/SUBMISSION.md`.
- Laptop ve telefonun neyi nasıl yaptığını dürüstçe söyle. Bu, jüri için artıdır.
