import { CARDS, type Card, type Severity } from "../content/cards";
import { SOURCES } from "../content/sources";
import { searchCards } from "../core/search";
import { localResult, mergeResult, type Layer, type TriageResult } from "../core/triage";
import { classifySituation } from "../hybrid";
import { getLang, t, type MessageKey } from "../i18n";
import { h } from "./dom";

const LAYER_LABELS: Record<Layer, MessageKey> = {
  on_device: "sourceDevice",
  in_cloud: "sourceCloud",
  library: "sourceLibrary",
};

const SEVERITIES: { severity: Severity; label: MessageKey }[] = [
  { severity: "life", label: "severityLife" },
  { severity: "urgent", label: "severityUrgent" },
  { severity: "safety", label: "severitySafety" },
];

interface EmergencyState {
  query: string;
  result: TriageResult | null;
  /** Kullanıcı konuyu listeden seçtiyse rozet gösterilmez. */
  picked: boolean;
  checking: boolean;
}

export function createEmergencyView(onActiveLayer: (layer: Layer | null) => void) {
  const root = h("section", { class: "view" });
  // Cevap alanı ayrı tutulur. NEDEN: Model geç cevap verince yalnızca burası
  // yenilenir, kullanıcının yazdığı metin ve odağı kaybolmaz.
  const answerHost = h("div", {});
  const state: EmergencyState = { query: "", result: null, picked: false, checking: false };
  let requestId = 0;

  async function search(text: string): Promise<void> {
    const query = text.trim();
    if (!query) return;
    const id = ++requestId;
    const local = searchCards(query);

    // NEDEN önce yerel sonuç: Tıkalı ağda kimse 8 saniye boş ekrana bakmamalı.
    // Kart anında çıkar, model cevap verirse sonuç yerinde güncellenir.
    Object.assign(state, { query, result: localResult(local), picked: false, checking: true });
    onActiveLayer("library");
    renderAnswer();
    focusAnswer();

    const choice = await classifySituation(query, getLang());
    if (id !== requestId) return;
    state.result = mergeResult(local, choice);
    state.checking = false;
    onActiveLayer(state.result.layer);
    renderAnswer();
  }

  function open(card: Card): void {
    requestId++;
    Object.assign(state, { result: { primary: card, related: [], layer: "library" }, picked: true, checking: false });
    onActiveLayer(null);
    renderAnswer();
    focusAnswer();
  }

  function focusAnswer(): void {
    // Ekran okuyucu başlığa gelir, görsel olarak ise kaynak rozeti de görünür kalır.
    root.querySelector<HTMLElement>("#answer-title")?.focus({ preventScroll: true });
    answerHost.scrollIntoView({ block: "start" });
  }

  function cardView(card: Card): HTMLElement {
    const lang = getLang();
    return h(
      "article",
      { class: `answer severity-${card.severity}` },
      h("h2", { id: "answer-title", tabindex: "-1" }, card.title[lang]),
      h("ol", { class: "steps" }, ...card.steps[lang].map((step) => h("li", {}, step))),
      card.warnings[lang].length > 0 &&
        h(
          "div",
          { class: "warnings" },
          h("h3", {}, t("warningsTitle")),
          h("ul", {}, ...card.warnings[lang].map((warning) => h("li", {}, warning))),
        ),
      h("p", { class: "call-line" }, t("cardCall")),
      h(
        "p",
        { class: "fine" },
        `${t("sourcesTitle")}: `,
        ...card.sources.flatMap((id, index) => [
          index > 0 ? ", " : "",
          h("a", { href: SOURCES[id].url, target: "_blank", rel: "noreferrer" }, SOURCES[id].name),
        ]),
      ),
      h("p", { class: "fine" }, t("reviewNote")),
    );
  }

  function answerView(): HTMLElement | null {
    const { result, picked, checking } = state;
    if (!result) return null;
    return h(
      "div",
      { "aria-live": "polite" },
      !picked &&
        h(
          "p",
          { class: "source" },
          h("span", { class: `badge layer-${result.layer}` }, t(LAYER_LABELS[result.layer])),
          checking && h("span", { class: "checking" }, t("checking")),
        ),
      result.primary
        ? cardView(result.primary)
        : h("p", { class: "no-match", id: "answer-title", tabindex: "-1" }, checking ? t("checking") : t("noMatch")),
      result.related.length > 0 &&
        h(
          "div",
          { class: "related" },
          h("h3", {}, t("relatedTitle")),
          ...result.related.map((card) =>
            h("button", { type: "button", class: "topic", onClick: () => open(card) }, card.title[getLang()]),
          ),
        ),
    );
  }

  function topicsView(): HTMLElement {
    return h(
      "div",
      { class: "topics" },
      h("h2", {}, t("topicsTitle")),
      ...SEVERITIES.map(({ severity, label }) =>
        h(
          "div",
          { class: `topic-group severity-${severity}` },
          h("h3", {}, t(label)),
          ...CARDS.filter((card) => card.severity === severity).map((card) =>
            h("button", { type: "button", class: "topic", onClick: () => open(card) }, card.title[getLang()]),
          ),
        ),
      ),
    );
  }

  function render(): void {
    const input = h("textarea", {
      id: "ask",
      rows: "2",
      placeholder: t("askPlaceholder"),
      onInput: () => {
        state.query = input.value;
      },
    });
    input.value = state.query;
    const form = h(
      "form",
      {
        class: "ask",
        onSubmit: (event) => {
          event.preventDefault();
          void search(input.value);
        },
      },
      h("label", { for: "ask" }, t("askLabel")),
      input,
      h("button", { type: "submit", class: "primary" }, t("askButton")),
    );
    renderAnswer();
    root.replaceChildren(form, answerHost, topicsView());
  }

  function renderAnswer(): void {
    const answer = answerView();
    answerHost.replaceChildren(...(answer ? [answer] : []));
  }

  return { root, render };
}
