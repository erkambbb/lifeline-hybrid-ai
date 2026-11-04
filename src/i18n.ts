export type Lang = "tr" | "en";

// Yayınlanan uygulamanın dili Türkçedir. İngilizce, yarışma jürisi ve Türkçe
// bilmeyen kullanıcılar içindir. Jüri bağlantısı: https://.../?lang=en
const DEFAULT_LANG: Lang = "tr";
const STORAGE_KEY = "lifeline.lang";

const tr = {
  pageTitle: "Lifeline: altyapı testi",
  switchLanguage: "English",
  note: "Altyapı test sayfası. Hibrit yapay zekâ yığınını sınar, acil durum bilgisi vermez. Acil durumda 112'yi arayın.",
  statusTitle: "Durum",
  network: "Ağ",
  offlineShell: "Çevrimdışı açılış",
  deviceModel: "Cihazdaki model",
  downloadModel: "Cihazdaki modeli indir",
  testTitle: "Model testi",
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
  sourceDevice: "📱 Cihazda",
  sourceCloud: "☁️ Bulutta",
  sourceUnknown: "Kaynak bilinmiyor",
  errorDownload: "İndirme başarısız",
  errorAnswer: "Cevap alınamadı",
};

export type MessageKey = keyof typeof tr;

// Record<MessageKey, string> sayesinde bir çeviri eksikse TypeScript derlemeyi
// durdurur. NEDEN: Eksik metni kullanıcıdan önce biz görmeliyiz.
const en: Record<MessageKey, string> = {
  pageTitle: "Lifeline: infrastructure test",
  switchLanguage: "Türkçe",
  note: "Infrastructure test page. It checks the hybrid AI stack and gives no emergency guidance. In an emergency, call 112.",
  statusTitle: "Status",
  network: "Network",
  offlineShell: "Offline startup",
  deviceModel: "On-device model",
  downloadModel: "Download on-device model",
  testTitle: "Model test",
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
  sourceDevice: "📱 On-device",
  sourceCloud: "☁️ Cloud",
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

/** Sayfadaki data-i18n öğelerinin metnini geçerli dile çevirir. */
export function translatePage(): void {
  document.documentElement.lang = currentLang;
  document.title = t("pageTitle");
  for (const node of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n as MessageKey);
  }
}
