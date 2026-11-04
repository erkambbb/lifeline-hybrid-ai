import { registerSW } from "virtual:pwa-register";
import { isFirebaseConfigured } from "./firebase";
import {
  ask,
  createModel,
  downloadDeviceModel,
  getDeviceStatus,
  type DeviceStatus,
  type Mode,
} from "./hybrid";
import "./style.css";

/** Sayfadaki bir öğeyi kimliğiyle bulur. Öğe yoksa hemen hata verir. */
function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Öğe bulunamadı: #${id}`);
  return found as T;
}

const networkStatus = element("status-network");
const swStatus = element("status-sw");
const firebaseStatus = element("status-firebase");
const deviceStatus = element("status-device");
const downloadButton = element<HTMLButtonElement>("download");
const downloadProgress = element<HTMLProgressElement>("download-progress");
const form = element<HTMLFormElement>("prompt-form");
const modeSelect = element<HTMLSelectElement>("mode");
const promptInput = element<HTMLTextAreaElement>("prompt");
const sendButton = element<HTMLButtonElement>("send");
const result = element<HTMLOutputElement>("result");
const resultSource = element("result-source");
const resultTime = element("result-time");
const resultText = element("result-text");
const errorBox = element("error");

const DEVICE_LABELS: Record<DeviceStatus, string> = {
  unsupported: "Bu tarayıcıda desteklenmiyor",
  unavailable: "Bu cihazda kullanılamıyor",
  downloadable: "Henüz indirilmedi",
  downloading: "İndiriliyor",
  available: "Hazır, internetsiz çalışır",
};

const SOURCE_LABELS: Record<string, string> = {
  on_device: "📱 Cihazda",
  in_cloud: "☁️ Bulutta",
};

function showNetwork(): void {
  // navigator.onLine yalnızca "ağ kartı bağlı mı" der, internetin çalıştığını
  // garanti etmez. Bu yüzden karar için değil, sadece bilgi için kullanıyoruz.
  networkStatus.textContent = navigator.onLine ? "Çevrimiçi" : "Çevrimdışı";
}

async function showDeviceModel(): Promise<void> {
  const status = await getDeviceStatus();
  deviceStatus.textContent = DEVICE_LABELS[status];
  downloadButton.hidden = status !== "downloadable" && status !== "downloading";
}

function showError(message: string): void {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

async function onDownloadClick(): Promise<void> {
  errorBox.hidden = true;
  downloadButton.disabled = true;
  downloadProgress.hidden = false;
  try {
    await downloadDeviceModel(createModel(modeSelect.value as Mode), (fraction) => {
      downloadProgress.value = fraction;
    });
  } catch (error) {
    showError(`İndirme başarısız: ${String(error)}`);
  } finally {
    downloadButton.disabled = false;
    downloadProgress.hidden = true;
    await showDeviceModel();
  }
}

async function onSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  errorBox.hidden = true;
  result.hidden = true;
  sendButton.disabled = true;
  try {
    const answer = await ask(createModel(modeSelect.value as Mode), promptInput.value);
    resultSource.textContent = SOURCE_LABELS[answer.source] ?? "Kaynak bilinmiyor";
    resultTime.textContent = `${answer.elapsedMs} ms`;
    // textContent kullanıyoruz, innerHTML değil.
    // NEDEN: Model çıktısı güvenilmez metindir, HTML olarak çalıştırılmamalıdır.
    resultText.textContent = answer.text;
    result.hidden = false;
  } catch (error) {
    showError(`Cevap alınamadı: ${String(error)}`);
  } finally {
    sendButton.disabled = false;
  }
}

function startOfflineSupport(): void {
  registerSW({
    immediate: true,
    onOfflineReady: () => {
      swStatus.textContent = "Hazır, uygulama internetsiz açılır";
    },
    onRegisteredSW: (_url, registration) => {
      if (registration?.active) {
        swStatus.textContent = "Hazır, uygulama internetsiz açılır";
      }
    },
    onRegisterError: (error) => {
      swStatus.textContent = `Başarısız: ${String(error)}`;
    },
  });

  // Tarayıcıdan önbelleği silmemesini isteriz.
  // NEDEN: Disk dolunca tarayıcı önbelleği temizleyebilir. Afet uygulamasının
  // tam ihtiyaç anında kaybolmaması gerekir.
  void navigator.storage?.persist?.();
}

swStatus.textContent = import.meta.env.DEV
  ? "Geliştirme modunda kapalı, npm run preview kullan"
  : "Kuruluyor";
firebaseStatus.textContent = isFirebaseConfigured
  ? "Yapılandırıldı"
  : "Yapılandırılmadı, bulut kapalı (bkz. docs/FIREBASE_SETUP.md)";

window.addEventListener("online", showNetwork);
window.addEventListener("offline", showNetwork);
downloadButton.addEventListener("click", () => void onDownloadClick());
form.addEventListener("submit", (event) => void onSubmit(event));

showNetwork();
void showDeviceModel();
startOfflineSupport();
