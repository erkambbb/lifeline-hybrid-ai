import { CARDS, type Card } from "../content/cards";
import { normalize } from "./normalize";

function keywordPattern(keyword: string): RegExp {
  const exact = keyword.endsWith("$");
  const stem = normalize(exact ? keyword.slice(0, -1) : keyword);
  // Türkçe sondan eklemeli bir dil: "kaniyor" kökü "kaniyorum"u da yakalamalı.
  return new RegExp(`(^| )${stem}${exact ? "( |$)" : ""}`);
}

const INDEX = CARDS.map((card) => ({ card, patterns: card.keywords.map(keywordPattern) }));

/**
 * Model ve ağ olmadan çalışan yerel arama. Üçüncü katman budur.
 * Çevrimdışı telefonlarda tek yol olduğu gibi, çeviri hatalarına karşı da güvencedir.
 */
export function searchCards(text: string, limit = 3): Card[] {
  const query = normalize(text);
  if (!query) return [];
  return INDEX.map(({ card, patterns }, order) => ({
    card,
    order,
    score: patterns.filter((pattern) => pattern.test(query)).length,
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.card);
}
