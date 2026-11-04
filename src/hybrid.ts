import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  Schema,
  type GenerationConfig,
  type GenerativeModel,
  type LanguageModelExpected,
} from "firebase/ai";
import { CARDS, CARD_IDS } from "./content/cards";
import type { HelpFacts } from "./core/help-message";
import type { ModelChoice } from "./core/triage";
import { firebaseApp } from "./firebase";
import type { Lang } from "./i18n";
import { translateToEnglish } from "./translate";

export type Mode = (typeof InferenceMode)[keyof typeof InferenceMode];

/** Bulut modeli. Güncel adlar: https://firebase.google.com/docs/ai-logic/models */
const CLOUD_MODEL = "gemini-3.8-flash";

// SDK'nın varsayılan zaman aşımı 180 saniyedir.
// NEDEN kısaltıyoruz: Depremden sonra ağ çoğu zaman tamamen kopmaz, tıkanır.
// Paniğe kapılmış birini 3 dakika boş ekranda bekletemeyiz.
const CLOUD_TIMEOUT_MS = 8_000;

// Cihazdaki modelin SDK tarafında zaman aşımı yok, bu yüzden kendimiz koyuyoruz.
const DEVICE_TIMEOUT_MS = 15_000;

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

interface HybridRequest {
  /** Bulut modeli için çıktı biçimi. */
  cloud: GenerationConfig;
  /** Cihazdaki model için çıktı kısıtı. */
  constraint: object;
  prompt: (situation: string) => string;
}

interface HybridReply {
  text: string;
  source: ModelChoice["source"];
}

function structuredModel(mode: Mode, request: HybridRequest): GenerativeModel {
  return getGenerativeModel(
    ai,
    {
      mode,
      inCloudParams: { model: CLOUD_MODEL, generationConfig: request.cloud },
      onDeviceParams: {
        createOptions: { ...ON_DEVICE_OPTIONS },
        promptOptions: { responseConstraint: request.constraint },
      },
    },
    { timeout: CLOUD_TIMEOUT_MS },
  );
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

async function generate(model: GenerativeModel, prompt: string): Promise<HybridReply> {
  const { response } = await withTimeout(model.generateContent(prompt), DEVICE_TIMEOUT_MS);
  return {
    text: response.text(),
    source: response.inferenceSource === "on_device" ? "on_device" : "in_cloud",
  };
}

/**
 * Hibrit isteğin tamamı. Sıra: cihaz, bulut. İkisi de olmazsa null döner ve
 * uygulama yerel aramayla devam eder.
 *
 * NEDEN ayrıca buluta düşüyoruz: availability() "available" dese bile model
 * yüklenemeyebilir (ör. boş VRAM yok). SDK bu hatada buluta kendisi geçmez.
 */
async function askHybrid(request: HybridRequest, text: string, lang: Lang): Promise<HybridReply | null> {
  const deviceReady = (await getDeviceStatus()) === "available";
  if (!deviceReady && !navigator.onLine) return null;

  // Nano yalnızca İngilizce kabul eder. Bulut ise Türkçeyi doğrudan anlar.
  const deviceText = deviceReady && lang === "tr" ? await translateToEnglish(text) : text;
  const canUseDevice = deviceReady && deviceText !== null;

  if (canUseDevice || !deviceReady) {
    try {
      const prompt = request.prompt(canUseDevice ? deviceText : text);
      return await generate(structuredModel(InferenceMode.PREFER_ON_DEVICE, request), prompt);
    } catch {
      if (!deviceReady) return null;
    }
  }

  if (!navigator.onLine) return null;
  try {
    return await generate(structuredModel(InferenceMode.ONLY_IN_CLOUD, request), request.prompt(text));
  } catch {
    return null;
  }
}

const OTHER = "other";
const cardSchema = Schema.enumString({ enum: [...CARD_IDS, OTHER] });
const cardList = CARDS.map((card) => `${card.id}: ${card.hint}`).join("\n");

const CLASSIFY: HybridRequest = {
  cloud: { responseMimeType: "text/x.enum", responseSchema: cardSchema },
  constraint: cardSchema,
  // Model talimat yazmaz, yalnızca listeden bir kimlik seçer. Grounding budur.
  prompt: (situation) =>
    `You sort emergency messages after an earthquake. Pick the single best id for the most ` +
    `life-threatening problem in the message. Pick ${OTHER} if nothing fits.\n\n${cardList}\n\n` +
    `Message: ${situation}`,
};

/** Durumu bilgi kartlarından birine eşler. Seçim yapılamazsa null döner. */
export async function classifySituation(text: string, lang: Lang): Promise<ModelChoice | null> {
  const reply = await askHybrid(CLASSIFY, text, lang);
  const id = reply?.text.trim() ?? "";
  return reply && CARD_IDS.includes(id) ? { id, source: reply.source } : null;
}

const factsSchema = Schema.object({
  properties: {
    people: Schema.integer({ nullable: true }),
    injured: Schema.integer({ nullable: true }),
    floor: Schema.integer({ nullable: true }),
    trapped: Schema.boolean(),
  },
});

const EXTRACT: HybridRequest = {
  cloud: { responseMimeType: "application/json", responseSchema: factsSchema },
  constraint: factsSchema,
  prompt: (situation) =>
    `Extract facts from this emergency message. people: how many people are there. injured: how ` +
    `many are hurt. floor: the building floor. trapped: true if under rubble. Use null if the ` +
    `message does not say.\n\nMessage: ${situation}`,
};

/** Dağınık anlatımdan bilgi çıkarır. Model yoksa null döner. */
export async function extractWithModel(
  text: string,
  lang: Lang,
): Promise<{ facts: Partial<HelpFacts>; source: ModelChoice["source"] } | null> {
  const reply = await askHybrid(EXTRACT, text, lang);
  if (!reply) return null;
  try {
    return { facts: JSON.parse(reply.text) as Partial<HelpFacts>, source: reply.source };
  } catch {
    return null;
  }
}
