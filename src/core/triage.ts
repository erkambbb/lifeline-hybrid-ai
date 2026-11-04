import type { Card } from "../content/cards";
import { findCard } from "../content/cards";

/** Cevabı üreten katman. Arayüzdeki rozet bunu gösterir. */
export type Layer = "on_device" | "in_cloud" | "library";

export interface TriageResult {
  primary: Card | null;
  related: Card[];
  layer: Layer;
}

export interface ModelChoice {
  id: string;
  source: "on_device" | "in_cloud";
}

/** Yalnızca yerel arama sonucu. Ekrana anında bu çıkar. */
export function localResult(local: Card[]): TriageResult {
  return { primary: local[0] ?? null, related: local.slice(1), layer: "library" };
}

/**
 * Model seçimini yerel aramayla birleştirir.
 * GÜVENLİK KURALI: Yerel arama hayati bir kart bulduysa ve model daha hafif bir
 * kart seçtiyse hayati kart öne geçer. NEDEN: "bacağım sıkıştı", çeviride
 * "my leg is tight" oldu. Çeviri hatası enkaz altındaki birini gizlememeli.
 */
export function mergeResult(local: Card[], choice: ModelChoice | null): TriageResult {
  const card = choice ? findCard(choice.id) : undefined;
  if (!choice || !card) return localResult(local);

  const others = local.filter((item) => item.id !== card.id);
  const top = others[0];
  if (top && local[0]?.id === top.id && top.severity === "life" && card.severity !== "life") {
    return { primary: top, related: [card, ...others.slice(1)].slice(0, 2), layer: "library" };
  }
  return { primary: card, related: others.slice(0, 2), layer: choice.source };
}
