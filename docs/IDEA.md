# Lifeline (Can Hattı): an offline-first hybrid AI disaster assistant

Project idea for the Firebase #BuildHybridAI 2026 hackathon. The app is called
Lifeline in English and Can Hattı in Turkish.

## Problem

In the first hours after a major earthquake, mobile internet often fails or
becomes congested. This is the moment when people need guidance most, and it
is the moment when cloud-based AI stops working.

The 6 February 2023 Kahramanmaraş earthquakes in Türkiye show the pattern:

- Turkcell said about half of its 3,300 base stations in the region were out
  of service immediately after the earthquakes, because of power outages and
  destruction [1].
- A post-earthquake assessment found that interruptions to mobile and internet
  services were primarily caused by power outages. Generators could supply
  only 3-4 hours of energy on average, so service stayed limited [2].
- A quick-response field study found that communication was down for about one
  day to several days, depending on the location. Mobile GSM vehicles started
  to reach the field after 2-3 days [3].

During this gap, frightened people need clear answers to urgent questions: how
to stop bleeding, how to survive under rubble, what to do about a gas smell,
and how to call for help. A panicked person cannot search through a PDF, and a
cloud chatbot cannot answer without a connection.

## Solution

Lifeline is a Progressive Web App that people install before a disaster. Every
request goes to the best layer that the device can offer:

- **📱 On-device (Cihazda):** Gemini Nano answers with no network, on capable devices.
- **☁️ Cloud (Bulutta):** Gemini Flash answers on any device that has a connection.
- **📚 Offline library (Çevrimdışı kütüphane):** with no model and no network, a local search over the
  built-in knowledge base still finds the right guidance.

Firebase AI Logic hybrid inference manages the move between the on-device and
cloud models, so the person using the app does not have to think about it.

The core promise is simple: help works on every device, and AI works at the best
level that the device allows.

## Core features (MVP)

### 1. Emergency guide

The user describes their situation in their own words, for example "my arm is
bleeding", "I am trapped under rubble", or "I smell gas". The app replies with
short, calm, step-by-step instructions.

The model does not invent instructions. The guidance lives in human-written
knowledge cards that ship inside the app and are compiled from trusted sources
such as AFAD, the Turkish Red Crescent (Türk Kızılay), and the IFRC / Red Cross.
The model only understands the situation and selects a card from a fixed list,
so it cannot write a medical instruction of its own. Every answer cites its
source and includes a "Call 112" reminder.

### 2. Help message builder

The user gives a messy description, for example "3 of us, my mother is hurt,
we are on the 2nd floor". The app combines it with the device location and
produces a short, structured SMS. It then opens the phone's messaging app with
the text ready to send, through an `sms:` URI.

The SMS still needs a cellular network to leave the phone. The feature prepares
the message in seconds, so that the person is ready when any signal returns.

### 3. Hybrid status indicator

Every answer shows where it came from: 📱 On-device, ☁️ Cloud, or 📚 Offline
library. The user can see that the app is still working, and the source of each
answer is never hidden.

### 4. Preparedness mode

Everyday use before a disaster: an earthquake bag checklist and a family
emergency plan. This mode gives people a reason to install the app and open it
before they need it.

## Language

The app supports Turkish and English. Turkish is the default, because the released
app serves people in Türkiye during a crisis. An English mode serves everyone else.
The hackathon submission is fully in English: the judges get a `?lang=en` link, and
the demo video runs in English.

The on-device model does not accept Turkish yet. On desktop, Chrome's on-device
Translator API bridges Turkish input to English. The user still reads
human-written Turkish cards, so answer quality does not depend on the model's
Turkish.

## Target audience

People who live in regions with high earthquake risk, with Türkiye as the
first focus.

## Platform reality

The design follows what the platforms support today. Details and sources are in
`docs/RESEARCH.md`.

- Gemini Nano in the browser runs on desktop Chrome only. Chrome on Android and
  iOS is not supported yet, so phones use the cloud or the offline library.
- After a one-time download, the on-device model works with no connection.
- A device that cannot run the model still gets offline guidance from the local
  search.
- Hybrid inference is a real choice here, not only a fallback. On a congested
  network the app does not wait for the cloud, because it tries the device first.

## Sources

1. DCD / SDxCentral, "Turkcell outlines response to last month's devastating
   earthquakes", 13 March 2023.
   <https://www.sdxcentral.com/news/turkcell-outlines-response-to-last-months-devastating-earthquakes/>
2. "2023 Kahramanmaraş and Hatay Earthquakes Report", Post-Earthquake
   Assessment, section 4.2.5 Communication, March 2023, hosted by TELKODER.
   <https://telkoder.org.tr/wp-content/uploads/2023/03/2023-KahramanmarasandHatayEarthquakesReport.pdf>
3. Comfort, Erkan, Celik, "Mapping the communication and coordination networks
   in response to the Kahramanmaraş Earthquakes, Türkiye, 6 February 2023",
   Quick Response Study, Natural Hazards Center, 22 March 2023.
   <https://converge.colorado.edu/wp-content/uploads/2023/03/SCELIK_SSEER-Presentation_March-22_2023.pdf>

## Türkçe özet

Büyük depremlerden sonraki ilk saatlerde mobil internet çöker veya tıkanır;
bulut tabanlı yapay zekâ da tam bu anda çalışmaz. Lifeline, afetten önce
yüklenen bir PWA'dır. Uygun cihazda cihazdaki modelle (Gemini Nano), bağlantı
varsa buluttaki modelle (Gemini Flash) çalışır; geçişi Firebase AI Logic hibrit
çıkarım yönetir. Model ve ağ yoksa uygulama içindeki yerel arama devreye girer.
Model talimat yazmaz, insanların hazırladığı bilgi kartlarından birini seçer.

MVP dört özellikten oluşur: güvenilir kaynaklara dayalı acil durum rehberi,
konumlu yardım SMS'i oluşturucu, her cevabın kaynağını gösteren hibrit gösterge
ve afet öncesi hazırlık modu. Uygulama varsayılan olarak Türkçedir ve İngilizce seçeneği vardır. Yarışmaya
İngilizce gönderilir. Hedef kitle, başta
Türkiye olmak üzere deprem riski yüksek bölgelerde yaşayanlardır.
