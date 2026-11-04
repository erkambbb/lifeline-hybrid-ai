export type Lang = "tr" | "en";

// Yayınlanan uygulamanın dili Türkçedir. İngilizce, yarışma jürisi ve Türkçe
// bilmeyen kullanıcılar içindir. Jüri bağlantısı: https://.../?lang=en
const DEFAULT_LANG: Lang = "tr";
const STORAGE_KEY = "lifeline.lang";

const tr = {
  appName: "Can Hattı",
  switchLanguage: "English",
  tabEmergency: "Acil",
  tabMessage: "Yardım mesajı",
  tabPrepare: "Hazırlık",
  call112: "112'yi ara",
  layersLabel: "Çalışan katmanlar",
  layerCloud: "Bulut",
  layerDevice: "Cihaz",
  layerLibrary: "Kütüphane",
  askLabel: "Ne oldu?",
  askPlaceholder: "Örnek: kolum kanıyor",
  askButton: "Yardım bul",
  checking: "Yapay zekâ kontrol ediyor",
  sourceDevice: "📱 Cihazda",
  sourceCloud: "☁️ Bulutta",
  sourceLibrary: "📚 Çevrimdışı kütüphane",
  noMatch: "Bu durum için kart bulamadım. Aşağıdan konu seç veya 112'yi ara.",
  warningsTitle: "Dikkat",
  sourcesTitle: "Kaynak",
  relatedTitle: "Bunlar da olabilir",
  topicsTitle: "Konular",
  severityLife: "Hayati",
  severityUrgent: "Acil",
  severitySafety: "Güvenlik",
  cardCall: "Durum ciddiyse hemen 112'yi ara.",
  reviewNote: "Bu kart henüz sağlık uzmanı tarafından incelenmedi. Profesyonel yardımın yerini tutmaz.",
  messageIntro: "Durumunu yaz. Uygulama kısa bir yardım mesajı hazırlasın.",
  messageLabel: "Durumun",
  messagePlaceholder: "Örnek: 3 kişiyiz, annem yaralı, 2. kattayız",
  addressLabel: "Adres (konum alınamazsa)",
  prepareMessage: "Mesajı hazırla",
  preparing: "Hazırlanıyor",
  locationAdded: "Konum eklendi",
  locationMissing: "Konum alınamadı. Adresi elle yaz.",
  draftLabel: "Hazır mesaj",
  characters: "karakter",
  openSms: "Mesaj uygulamasında aç",
  sendTo: "Gönder:",
  copyText: "Metni kopyala",
  copied: "Kopyalandı",
  copyFailed: "Kopyalanamadı. Metni elle seç.",
  signalNote: "Mesaj için şebeke gerekir. Sinyal yoksa mesajı hazır tut, sinyal gelince gönder.",
  noContacts: "Aile planına kişi eklersen burada görünür.",
  readinessTitle: "İnternet kesilmeden önce",
  readinessIntro: "Bunları şimdi hazırla. Afet anında indirme yapamazsın.",
  itemApp: "Uygulama",
  itemLocation: "Konum izni",
  itemTranslator: "Çeviri paketi",
  itemModel: "Cihazdaki yapay zekâ",
  allow: "İzin ver",
  notGranted: "Henüz verilmedi",
  download: "İndir",
  ready: "Hazır",
  notOnThisDevice: "Bu cihazda yok, yerel arama çalışır",
  bagTitle: "Afet çantası",
  bagReady: "hazır",
  planTitle: "Aile planı",
  meetingLabel: "Buluşma noktası",
  meetingPlaceholder: "Örnek: Okulun bahçesi",
  contactsTitle: "Haber verilecek kişiler",
  contactName: "Ad",
  contactPhone: "Telefon",
  addContact: "Kişi ekle",
  removeContact: "Sil",
  technicalTitle: "Teknik test",
  network: "Ağ",
  offlineShell: "Çevrimdışı açılış",
  deviceModel: "Cihazdaki model",
  inferenceMode: "Çıkarım modu",
  modePreferDevice: "Önce cihaz",
  modePreferCloud: "Önce bulut",
  modeOnlyDevice: "Yalnızca cihaz",
  modeOnlyCloud: "Yalnızca bulut",
  message: "Mesaj",
  defaultPrompt: "Bana tek cümleyle merhaba de.",
  send: "Gönder",
  online: "Çevrimiçi",
  offline: "Çevrimdışı",
  swDev: "Geliştirme modunda kapalı, npm run preview kullan",
  swInstalling: "Kuruluyor",
  swReady: "Hazır, uygulama internetsiz açılır",
  swFailed: "Başarısız",
  firebaseReady: "Yapılandırıldı",
  firebaseMissing: "Yapılandırılmadı, bulut kapalı (bkz. docs/FIREBASE_SETUP.md)",
  deviceUnsupported: "Bu tarayıcıda desteklenmiyor",
  deviceUnavailable: "Bu cihazda kullanılamıyor",
  deviceDownloadable: "Henüz indirilmedi",
  deviceDownloading: "İndiriliyor",
  deviceAvailable: "Hazır, internetsiz çalışır",
  sourceUnknown: "Kaynak bilinmiyor",
  errorDownload: "İndirme başarısız",
  errorAnswer: "Cevap alınamadı",
};

export type MessageKey = keyof typeof tr;

// Record<MessageKey, string> sayesinde bir çeviri eksikse TypeScript derlemeyi
// durdurur. NEDEN: Eksik metni kullanıcıdan önce biz görmeliyiz.
const en: Record<MessageKey, string> = {
  appName: "Lifeline",
  switchLanguage: "Türkçe",
  tabEmergency: "Emergency",
  tabMessage: "Help message",
  tabPrepare: "Prepare",
  call112: "Call 112",
  layersLabel: "Working layers",
  layerCloud: "Cloud",
  layerDevice: "Device",
  layerLibrary: "Library",
  askLabel: "What happened?",
  askPlaceholder: "Example: my arm is bleeding",
  askButton: "Find help",
  checking: "AI is checking",
  sourceDevice: "📱 On-device",
  sourceCloud: "☁️ Cloud",
  sourceLibrary: "📚 Offline library",
  noMatch: "No card matches this. Pick a topic below or call 112.",
  warningsTitle: "Warning",
  sourcesTitle: "Source",
  relatedTitle: "This may also apply",
  topicsTitle: "Topics",
  severityLife: "Life-threatening",
  severityUrgent: "Urgent",
  severitySafety: "Safety",
  cardCall: "If this is serious, call 112 now.",
  reviewNote: "No health professional has reviewed this card yet. It does not replace professional help.",
  messageIntro: "Describe your situation. The app prepares a short help message.",
  messageLabel: "Your situation",
  messagePlaceholder: "Example: 3 of us, my mother is injured, 2nd floor",
  addressLabel: "Address (if location fails)",
  prepareMessage: "Prepare message",
  preparing: "Preparing",
  locationAdded: "Location added",
  locationMissing: "Location unavailable. Type the address.",
  draftLabel: "Ready message",
  characters: "characters",
  openSms: "Open in messages",
  sendTo: "Send to:",
  copyText: "Copy text",
  copied: "Copied",
  copyFailed: "Copy failed. Select the text by hand.",
  signalNote: "SMS needs a cell network. With no signal, keep the message ready and send it when signal returns.",
  noContacts: "Contacts from your family plan appear here.",
  readinessTitle: "Before the internet goes down",
  readinessIntro: "Prepare these now. You cannot download them during a disaster.",
  itemApp: "App",
  itemLocation: "Location permission",
  itemTranslator: "Translation pack",
  itemModel: "On-device AI",
  allow: "Allow",
  notGranted: "Not granted yet",
  download: "Download",
  ready: "Ready",
  notOnThisDevice: "Not on this device, local search works",
  bagTitle: "Emergency bag",
  bagReady: "ready",
  planTitle: "Family plan",
  meetingLabel: "Meeting point",
  meetingPlaceholder: "Example: the school yard",
  contactsTitle: "People to notify",
  contactName: "Name",
  contactPhone: "Phone",
  addContact: "Add person",
  removeContact: "Remove",
  technicalTitle: "Technical test",
  network: "Network",
  offlineShell: "Offline startup",
  deviceModel: "On-device model",
  inferenceMode: "Inference mode",
  modePreferDevice: "Prefer on-device",
  modePreferCloud: "Prefer cloud",
  modeOnlyDevice: "Only on-device",
  modeOnlyCloud: "Only cloud",
  message: "Message",
  defaultPrompt: "Say hello in one short sentence.",
  send: "Send",
  online: "Online",
  offline: "Offline",
  swDev: "Off in dev mode, use npm run preview",
  swInstalling: "Installing",
  swReady: "Ready, the app opens without internet",
  swFailed: "Failed",
  firebaseReady: "Configured",
  firebaseMissing: "Not configured, cloud is off (see docs/FIREBASE_SETUP.md)",
  deviceUnsupported: "Not supported in this browser",
  deviceUnavailable: "Unavailable on this device",
  deviceDownloadable: "Not downloaded yet",
  deviceDownloading: "Downloading",
  deviceAvailable: "Ready, works without internet",
  sourceUnknown: "Unknown source",
  errorDownload: "Download failed",
  errorAnswer: "No answer",
};

const messages: Record<Lang, Record<MessageKey, string>> = { tr, en };

function isLang(value: string | null): value is Lang {
  return value === "tr" || value === "en";
}

// Tarayıcı depolaması gizli pencerede hata verebilir.
// NEDEN try/catch: Dil tercihi kaybolabilir ama uygulama asla çökmemelidir.
function readStoredLang(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Tercih kaydedilemedi, bu oturumda yine çalışır.
  }
}

/** Öncelik: adres çubuğu (?lang=en), sonra kayıtlı tercih, sonra Türkçe. */
function detectLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (isLang(fromUrl)) return fromUrl;
  const stored = readStoredLang();
  return isLang(stored) ? stored : DEFAULT_LANG;
}

let currentLang = detectLang();

export function getLang(): Lang {
  return currentLang;
}

/** Geçerli dilde metni döndürür. */
export function t(key: MessageKey): string {
  return messages[currentLang][key];
}

/** Dili değiştirir, tercihi saklar ve adres çubuğunu günceller. */
export function setLang(lang: Lang): void {
  currentLang = lang;
  storeLang(lang);
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
}

/** Sayfa başlığını ve dil etiketini geçerli dile çevirir. */
export function translatePage(): void {
  document.documentElement.lang = currentLang;
  document.title = t("appName");
}
