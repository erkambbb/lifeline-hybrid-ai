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
import { getLang, setLang, t, translatePage, type MessageKey } from "./i18n";
import "./style.css";

/** Sayfadaki bir öğeyi kimliğiyle bulur. Öğe yoksa hemen hata verir. */
function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Öğe bulunamadı: #${id}`);
  return found as T;
}

const languageButton = element<HTMLButtonElement>("language");
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

const DEVICE_LABELS: Record<DeviceStatus, MessageKey> = {
  unsupported: "deviceUnsupported",
  unavailable: "deviceUnavailable",
  downloadable: "deviceDownloadable",
  downloading: "deviceDownloading",
  available: "deviceAvailable",
};

const SOURCE_LABELS: Record<string, MessageKey> = {
  on_device: "sourceDevice",
  in_cloud: "sourceCloud",
};

// Dil değişince ekranın yeniden yazılabilmesi için durumu burada tutuyoruz.
let swState: MessageKey = import.meta.env.DEV ? "swDev" : "swInstalling";
let swErrorDetail = "";
let lastSource: string | null = null;

function showNetwork(): void {
  // navigator.onLine yalnızca "ağ kartı bağlı mı" der, internetin çalıştığını
  // garanti etmez. Bu yüzden karar için değil, sadece bilgi için kullanıyoruz.
  networkStatus.textContent = t(navigator.onLine ? "online" : "offline");
}

function showServiceWorker(): void {
  swStatus.textContent = swErrorDetail ? `${t(swState)}: ${swErrorDetail}` : t(swState);
}

function showFirebase(): void {
  firebaseStatus.textContent = t(isFirebaseConfigured ? "firebaseReady" : "firebaseMissing");
}

function showSource(): void {
  if (lastSource === null) return;
  resultSource.textContent = t(SOURCE_LABELS[lastSource] ?? "sourceUnknown");
}

async function showDeviceModel(): Promise<void> {
  const status = await getDeviceStatus();
  deviceStatus.textContent = t(DEVICE_LABELS[status]);
  downloadButton.hidden = status !== "downloadable" && status !== "downloading";
}

/** Tüm ekranı geçerli dilde yeniden yazar. */
function render(): void {
  translatePage();
  languageButton.textContent = t("switchLanguage");
  showNetwork();
  showServiceWorker();
  showFirebase();
  showSource();
  void showDeviceModel();
}

function onLanguageClick(): void {
  const previousDefault = t("defaultPrompt");
  setLang(getLang() === "tr" ? "en" : "tr");
  // Kullanıcı mesajı değiştirmediyse örnek mesaj da yeni dile geçer.
  if (promptInput.value === previousDefault) promptInput.value = t("defaultPrompt");
  render();
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
    showError(`${t("errorDownload")}: ${String(error)}`);
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
    lastSource = answer.source;
    showSource();
    resultTime.textContent = `${answer.elapsedMs} ms`;
    // textContent kullanıyoruz, innerHTML değil.
    // NEDEN: Model çıktısı güvenilmez metindir, HTML olarak çalıştırılmamalıdır.
    resultText.textContent = answer.text;
    result.hidden = false;
  } catch (error) {
    showError(`${t("errorAnswer")}: ${String(error)}`);
  } finally {
    sendButton.disabled = false;
  }
}

function startOfflineSupport(): void {
  registerSW({
    immediate: true,
    onOfflineReady: () => {
      swState = "swReady";
      showServiceWorker();
    },
    onRegisteredSW: (_url, registration) => {
      if (registration?.active) {
        swState = "swReady";
        showServiceWorker();
      }
    },
    onRegisterError: (error) => {
      swState = "swFailed";
      swErrorDetail = String(error);
      showServiceWorker();
    },
  });

  // Tarayıcıdan önbelleği silmemesini isteriz.
  // NEDEN: Disk dolunca tarayıcı önbelleği temizleyebilir. Afet uygulamasının
  // tam ihtiyaç anında kaybolmaması gerekir.
  void navigator.storage?.persist?.();
}

window.addEventListener("online", showNetwork);
window.addEventListener("offline", showNetwork);
languageButton.addEventListener("click", onLanguageClick);
downloadButton.addEventListener("click", () => void onDownloadClick());
form.addEventListener("submit", (event) => void onSubmit(event));

promptInput.value = t("defaultPrompt");
render();
startOfflineSupport();
