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
  if (!found) throw new Error(`Missing element: #${id}`);
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
  unsupported: "Not supported in this browser",
  unavailable: "Unavailable on this device",
  downloadable: "Not downloaded yet",
  downloading: "Downloading",
  available: "Ready, works without internet",
};

const SOURCE_LABELS: Record<string, string> = {
  on_device: "📱 On-device",
  in_cloud: "☁️ Cloud",
};

function showNetwork(): void {
  // navigator.onLine yalnızca "ağ kartı bağlı mı" der, internetin çalıştığını
  // garanti etmez. Bu yüzden karar için değil, sadece bilgi için kullanıyoruz.
  networkStatus.textContent = navigator.onLine ? "Online" : "Offline";
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
    showError(`Download failed: ${String(error)}`);
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
    resultSource.textContent = SOURCE_LABELS[answer.source] ?? answer.source;
    resultTime.textContent = `${answer.elapsedMs} ms`;
    // textContent kullanıyoruz, innerHTML değil.
    // NEDEN: Model çıktısı güvenilmez metindir, HTML olarak çalıştırılmamalıdır.
    resultText.textContent = answer.text;
    result.hidden = false;
  } catch (error) {
    showError(`No answer: ${String(error)}`);
  } finally {
    sendButton.disabled = false;
  }
}

function startOfflineSupport(): void {
  registerSW({
    immediate: true,
    onOfflineReady: () => {
      swStatus.textContent = "Ready, app opens without internet";
    },
    onRegisteredSW: (_url, registration) => {
      if (registration?.active) {
        swStatus.textContent = "Ready, app opens without internet";
      }
    },
    onRegisterError: (error) => {
      swStatus.textContent = `Failed: ${String(error)}`;
    },
  });

  // Tarayıcıdan önbelleği silmemesini isteriz.
  // NEDEN: Disk dolunca tarayıcı önbelleği temizleyebilir. Afet uygulamasının
  // tam ihtiyaç anında kaybolmaması gerekir.
  void navigator.storage?.persist?.();
}

swStatus.textContent = import.meta.env.DEV ? "Off in dev mode, use npm run preview" : "Installing";
firebaseStatus.textContent = isFirebaseConfigured
  ? "Configured"
  : "Not configured, cloud is off (see docs/FIREBASE_SETUP.md)";

window.addEventListener("online", showNetwork);
window.addEventListener("offline", showNetwork);
downloadButton.addEventListener("click", () => void onDownloadClick());
form.addEventListener("submit", (event) => void onSubmit(event));

showNetwork();
void showDeviceModel();
startOfflineSupport();
