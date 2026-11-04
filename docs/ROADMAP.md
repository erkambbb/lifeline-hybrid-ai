# Yol haritası: 9-30 Kasım 2026

Teslim: **30 Kasım 2026 Pazartesi, 14:00 PT**. Türkiye saatiyle bu, 1 Aralık
Salı 01:00 demektir. Hedefimiz 29 Kasım akşamı teslim etmek.

## 9 Kasım'dan önce (şu an)

Yalnızca altyapı, araştırma ve iskelet. Ana özellik yok.

- [x] Fikir, araştırma, repo, iskelet, ders planı
- [ ] Firebase kurulumu (`docs/FIREBASE_SETUP.md`)
- [ ] Devpost'ta **Join hackathon**
- [ ] `docs/LEARNING.md` derslerine başla
- [ ] Kurumlara izin e-postası at (`docs/RESEARCH.md`, bölüm 6)
- [ ] Son test: ağır uygulamaları kapat, çevrimdışı 📱 Cihazda cevabını gör
      (`docs/RESEARCH.md`, bölüm 8)

## 9 Kasım kontrol listesi

Kurallar bu gün yayınlanıyor. Kod yazmadan önce oku.

- [ ] Var olan projeler ve "önemli yeni geliştirme" şartı ne diyor?
- [ ] Yapay zekâ destekli geliştirmeye dair kural var mı?
- [ ] Zorunlu teslim öğeleri neler (video süresi, canlı URL, repo)?
- [ ] Bonus görevler neler?
- [ ] Yalnız web mi kabul ediliyor, Android da sayılıyor mu?
- [ ] Jüri kriterleri değişti mi? Şu an dört kriter var: Technological
      Implementation, Design, Potential Impact, Quality of the Idea.

## Hafta 1 (9-15 Kasım): ana özellikler

Amaç: üç katman uçtan uca çalışsın, içerik henüz az olsun.

- [ ] Bilgi tabanı şeması ve 3 örnek kart (kanama, enkaz altı, gaz kokusu)
- [ ] Katman 3: modelsiz çevrimdışı arama (Türkçe anahtar kelime)
- [ ] Katman 1-2: hibrit kart seçimi (enum çıktı)
- [ ] Translator API ile `tr → en` köprüsü ve çevrimdışı testi
- [ ] Yedek zinciri: cihaz hata verirse bulut, o da olmazsa yerel arama
- [ ] Hibrit gösterge: 📱 Cihazda, ☁️ Bulutta, 📚 Çevrimdışı kütüphane
- [ ] Yardım mesajı oluşturucu: yapılandırılmış çıkarım, konum, `sms:` bağlantısı
- [ ] Modelin ön indirilmesi için ilk kurulum akışı

## Hafta 2 (16-22 Kasım): bilgi tabanı ve cila

Amaç: içerik güvenilir olsun, ürün bütünlüklü görünsün.

- [ ] 15-20 Türkçe bilgi kartı, her biri kaynaklı
- [ ] Kartların sağlık bilgisi olan biri tarafından gözden geçirilmesi
- [ ] Hazırlık modu: deprem çantası listesi ve aile planı
- [ ] Panik dostu tasarım: büyük düğmeler, kısa metin, yüksek kontrast
- [ ] Erişilebilirlik ve telefon genişliği kontrolü

## Hafta 3 (23-30 Kasım): test, video, Devpost

Amaç: gerçek cihazlarda doğrula ve teslim et.

- [ ] Gerçek Android ve iPhone: kurulum, çevrimdışı açılış, `sms:`, GPS
- [ ] Uçak modu ve zayıf ağ testleri
- [ ] 10 örnek senaryoyla kart seçimi doğruluğu ölçümü
- [ ] Firebase Hosting'e yayın ve App Check metriklerinin kontrolü
- [ ] Demo videosu çekimi (aşağıda)
- [ ] Devpost sayfası ve ekran görüntüleri
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
- Uygulama tamamen Türkçe olduğu için videoya İngilizce altyazı ekle. Jüri
  ekrandaki metni ancak böyle anlar.
- Laptop ve telefonun neyi nasıl yaptığını dürüstçe söyle. Bu, jüri için artıdır.
