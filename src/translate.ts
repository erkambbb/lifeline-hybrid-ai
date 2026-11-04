// Chrome'un cihaz üstü çevirisi. Nano Türkçe kabul etmediği için köprüdür.
// Bu makinede ağ tamamen kapalıyken test edildi (docs/RESEARCH.md, bölüm 8).
const PAIR = { sourceLanguage: "tr", targetLanguage: "en" };

export type TranslatorStatus = "unsupported" | "unavailable" | "downloadable" | "downloading" | "available";

interface TranslatorInstance {
  translate(text: string): Promise<string>;
}

declare const Translator: {
  availability(pair: typeof PAIR): Promise<Exclude<TranslatorStatus, "unsupported">>;
  create(pair: typeof PAIR): Promise<TranslatorInstance>;
};

let instance: Promise<TranslatorInstance> | null = null;

export async function getTranslatorStatus(): Promise<TranslatorStatus> {
  if (!("Translator" in globalThis)) return "unsupported";
  return Translator.availability(PAIR);
}

/** Dil paketini indirir. Kullanıcı tıklamasının içinden çağrılmalıdır. */
export async function prepareTranslator(): Promise<void> {
  instance ??= Translator.create(PAIR);
  await instance;
}

/** Türkçe metni İngilizceye çevirir. Çeviri yapılamazsa null döner. */
export async function translateToEnglish(text: string): Promise<string | null> {
  try {
    if ((await getTranslatorStatus()) !== "available") return null;
    instance ??= Translator.create(PAIR);
    return await (await instance).translate(text);
  } catch {
    instance = null;
    return null;
  }
}
