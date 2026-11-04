import { describe, expect, it } from "vitest";
import { CARDS } from "../content/cards";
import { SOURCES } from "../content/sources";
import { normalize } from "./normalize";
import { searchCards } from "./search";

describe("normalize", () => {
  it("folds Turkish letters and punctuation", () => {
    expect(normalize("Bacağım SIKIŞTI!")).toBe("bacagim sikisti");
    expect(normalize("İnsanlar")).toBe("insanlar");
  });
});

describe("searchCards", () => {
  const cases: [string, string][] = [
    ["kolum kanıyor", "bleeding"],
    ["kolum kaniyor", "bleeding"],
    ["enkaz altındayım", "trapped"],
    ["gaz kokusu var", "gas"],
    // Translator bunu "My leg is tight" diye çevirdi. Yerel arama yakalamalı.
    ["bacağım sıkıştı nefes alamıyorum", "trapped"],
    ["babam nefes almıyor", "not-breathing"],
    ["annem bayıldı", "unresponsive"],
    ["kolum kırıldı", "fracture"],
    ["elim yandı", "burn"],
    ["çocuk donuyor", "cold"],
    ["deprem oluyor", "shaking"],
    ["artçı olur mu", "after-quake"],
    ["çok korkuyorum", "distress"],
    ["my arm is bleeding", "bleeding"],
    ["i am trapped", "trapped"],
    ["i smell gas", "gas"],
  ];

  it.each(cases)("%s -> %s", (text, id) => {
    expect(searchCards(text)[0]?.id).toBe(id);
  });

  it("does not match unrelated words that share letters", () => {
    expect(searchCards("kanepe aldık")).toEqual([]);
    expect(searchCards("merhaba")).toEqual([]);
    expect(searchCards("   ")).toEqual([]);
  });
});

describe("cards", () => {
  it("have the same number of steps in both languages", () => {
    for (const card of CARDS) {
      expect(card.steps.en.length, card.id).toBe(card.steps.tr.length);
      expect(card.warnings.en.length, card.id).toBe(card.warnings.tr.length);
      expect(card.steps.tr.length, card.id).toBeGreaterThan(0);
    }
  });

  it("each cite at least one known source", () => {
    for (const card of CARDS) {
      expect(card.sources.length, card.id).toBeGreaterThan(0);
      for (const source of card.sources) expect(SOURCES[source], card.id).toBeDefined();
    }
  });

  it("have unique ids", () => {
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length);
  });
});
