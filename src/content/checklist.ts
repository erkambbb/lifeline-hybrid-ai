import type { Lang } from "../i18n";

export interface ChecklistItem {
  id: string;
  label: Record<Lang, string>;
}

/** Afet çantası listesi. Kaynak: İBB AKOM afet eğitimleri. */
export const CHECKLIST: ChecklistItem[] = [
  { id: "water", label: { tr: "Herkes için içme suyu", en: "Drinking water for everyone" } },
  { id: "food", label: { tr: "Bozulmayan konserve ve kuru gıda", en: "Canned and dried food that keeps well" } },
  { id: "first-aid", label: { tr: "İlk yardım çantası", en: "First aid kit" } },
  { id: "whistle", label: { tr: "Düdük", en: "Whistle" } },
  { id: "flashlight", label: { tr: "El feneri ve yedek pil", en: "Flashlight and spare batteries" } },
  { id: "radio", label: { tr: "Pilli radyo", en: "Battery-powered radio" } },
  { id: "knife", label: { tr: "Çok amaçlı çakı ve küçük makas", en: "Multi-purpose knife and small scissors" } },
  { id: "documents", label: { tr: "Kimlik, tapu ve sigorta belgelerinin fotoğrafı", en: "Photos of IDs, deeds, and insurance papers" } },
  { id: "clothes", label: { tr: "Yedek iç çamaşırı, çorap ve yağmurluk", en: "Spare underwear, socks, and a raincoat" } },
  { id: "hygiene", label: { tr: "Sabun, maske, ıslak mendil ve tuvalet kâğıdı", en: "Soap, masks, wet wipes, and toilet paper" } },
  { id: "paper", label: { tr: "Kâğıt ve kurşun kalem", en: "Paper and a pencil" } },
  { id: "dependents", label: { tr: "Bebek, yaşlı, engelli ve evcil hayvan ihtiyaçları", en: "Supplies for babies, older or disabled relatives, and pets" } },
];
