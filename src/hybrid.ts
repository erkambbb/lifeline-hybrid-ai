import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  type GenerativeModel,
  type LanguageModelExpected,
} from "firebase/ai";
import { firebaseApp } from "./firebase";

export type Mode = (typeof InferenceMode)[keyof typeof InferenceMode];

/** Bulut modeli. Güncel adlar: https://firebase.google.com/docs/ai-logic/models */
const CLOUD_MODEL = "gemini-3.8-flash";

// SDK'nın varsayılan zaman aşımı 180 saniyedir.
// NEDEN kısaltıyoruz: Depremden sonra ağ çoğu zaman tamamen kopmaz, tıkanır.
// Paniğe kapılmış birini 3 dakika boş ekranda bekletemeyiz.
const CLOUD_TIMEOUT_MS = 10_000;

// Chrome Prompt API yalnızca "en", "ja", "es", "de", "fr" kabul eder.
// "tr" yazarsak model "unavailable" olur ve SDK sessizce buluta geçer.
// Ayrıntı: docs/RESEARCH.md, bölüm 2.
const ON_DEVICE_LANGUAGE: LanguageModelExpected = { type: "text", languages: ["en"] };
const ON_DEVICE_OPTIONS = {
  expectedInputs: [ON_DEVICE_LANGUAGE],
  expectedOutputs: [ON_DEVICE_LANGUAGE],
};

const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

/** Seçilen moda göre tek bir hibrit model nesnesi kurar. */
export function createModel(mode: Mode): GenerativeModel {
  return getGenerativeModel(
    ai,
    {
      mode,
      inCloudParams: { model: CLOUD_MODEL },
      onDeviceParams: { createOptions: { ...ON_DEVICE_OPTIONS } },
    },
    { timeout: CLOUD_TIMEOUT_MS },
  );
}

export type DeviceStatus =
  | "unsupported" // Bu tarayıcıda Prompt API yok (telefonlar dahil).
  | "unavailable" // API var ama donanım veya dil uygun değil.
  | "downloadable" // Model indirilebilir, kullanıcı tıklaması gerekir.
  | "downloading"
  | "available"; // Hazır. İnternet olmadan da çalışır.

declare const LanguageModel: {
  availability(options: typeof ON_DEVICE_OPTIONS): Promise<Exclude<DeviceStatus, "unsupported">>;
};

/** Cihazdaki modelin durumunu SDK ile aynı seçeneklerle sorar. */
export async function getDeviceStatus(): Promise<DeviceStatus> {
  if (!("LanguageModel" in globalThis)) return "unsupported";
  return LanguageModel.availability(ON_DEVICE_OPTIONS);
}

/**
 * Modeli önceden indirir.
 * Chrome bunun bir kullanıcı tıklamasıyla başlamasını zorunlu tutar, bu yüzden
 * bu fonksiyon yalnızca bir buton olayının içinden çağrılmalıdır.
 */
export async function downloadDeviceModel(
  model: GenerativeModel,
  onProgress: (fraction: number) => void,
): Promise<void> {
  await model.initializeDeviceModel(onProgress);
}

export interface Answer {
  text: string;
  /** Kullanıcıya gösterilecek kaynak: "on_device" veya "in_cloud". */
  source: string;
  elapsedMs: number;
}

/** Tek bir prompt gönderir ve cevabı, kaynağıyla birlikte döndürür. */
export async function ask(model: GenerativeModel, prompt: string): Promise<Answer> {
  const startedAt = performance.now();
  const { response } = await model.generateContent(prompt);
  return {
    text: response.text(),
    // Hibrit göstergenin kalbi: SDK her cevapta kaynağı burada bildirir.
    source: response.inferenceSource ?? "unknown",
    elapsedMs: Math.round(performance.now() - startedAt),
  };
}
