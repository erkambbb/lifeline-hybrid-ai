import { composeMessage, extractFacts, mergeFacts, SMS_LIMIT, smsUri } from "../core/help-message";
import { load } from "../core/storage";
import type { Layer } from "../core/triage";
import { extractWithModel } from "../hybrid";
import { getLang, t, type MessageKey } from "../i18n";
import { getLocation } from "../location";
import { h } from "./dom";
import type { Contact } from "./prepare";

const LAYER_LABELS: Record<Layer, MessageKey> = {
  on_device: "sourceDevice",
  in_cloud: "sourceCloud",
  library: "sourceLibrary",
};

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

interface MessageState {
  note: string;
  address: string;
  draft: string;
  layer: Layer | null;
  location: "added" | "missing" | null;
  busy: boolean;
  feedback: MessageKey | null;
}

export function createMessageView() {
  const root = h("section", { class: "view" });
  const state: MessageState = {
    note: "",
    address: "",
    draft: "",
    layer: null,
    location: null,
    busy: false,
    feedback: null,
  };

  async function prepare(): Promise<void> {
    if (!state.note.trim() && !state.address.trim()) return;
    Object.assign(state, { busy: true, feedback: null });
    render();

    // Konum ve model aynı anda çalışır. NEDEN: İkisi de saniyeler sürebilir.
    const lang = getLang();
    const [location, model] = await Promise.all([getLocation(), extractWithModel(state.note, lang)]);
    const facts = mergeFacts(extractFacts(state.note), model?.facts ?? null);
    Object.assign(state, {
      draft: composeMessage({ facts, note: state.note, location, address: state.address, lang }),
      layer: model?.source ?? "library",
      location: location ? "added" : "missing",
      busy: false,
    });
    render();
  }

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(state.draft);
      state.feedback = "copied";
    } catch {
      state.feedback = "copyFailed";
    }
    render();
  }

  function draftView(): HTMLElement | null {
    if (!state.draft) return null;
    const contacts = load<Contact[]>("contacts", []).filter((contact) => contact.phone.trim());
    const counter = h("span", {}, "");
    const links = h("div", { class: "send-links" });

    function refreshLinks(): void {
      counter.textContent = `${state.draft.length}/${SMS_LIMIT} ${t("characters")}`;
      counter.className = state.draft.length > SMS_LIMIT ? "over" : "";
      links.replaceChildren(
        ...contacts.map((contact) =>
          h("a", { class: "button primary", href: smsUri(contact.phone, state.draft, isIOS) }, `${t("sendTo")} ${contact.name || contact.phone}`),
        ),
        h("a", { class: `button${contacts.length ? "" : " primary"}`, href: smsUri("", state.draft, isIOS) }, t("openSms")),
      );
    }

    const draft = h("textarea", {
      id: "draft",
      rows: "4",
      onInput: () => {
        state.draft = draft.value;
        refreshLinks();
      },
    });
    draft.value = state.draft;
    refreshLinks();

    return h(
      "div",
      { class: "draft", "aria-live": "polite" },
      state.layer && h("p", { class: "source" }, h("span", { class: `badge layer-${state.layer}` }, t(LAYER_LABELS[state.layer]))),
      state.location && h("p", { class: state.location === "missing" ? "notice" : "fine" }, t(state.location === "added" ? "locationAdded" : "locationMissing")),
      h("label", { for: "draft" }, t("draftLabel")),
      draft,
      h("p", { class: "fine" }, counter),
      links,
      h("button", { type: "button", onClick: () => void copy() }, t("copyText")),
      state.feedback && h("p", { class: "fine" }, t(state.feedback)),
      contacts.length === 0 && h("p", { class: "fine" }, t("noContacts")),
      h("p", { class: "fine" }, t("signalNote")),
    );
  }

  function render(): void {
    const note = h("textarea", {
      id: "note",
      rows: "3",
      placeholder: t("messagePlaceholder"),
      onInput: () => {
        state.note = note.value;
      },
    });
    note.value = state.note;
    const address = h("input", {
      id: "address",
      type: "text",
      autocomplete: "street-address",
      onInput: () => {
        state.address = address.value;
      },
    });
    address.value = state.address;
    root.replaceChildren(
      ...[
        h("h2", {}, t("tabMessage")),
        h("p", { class: "lead" }, t("messageIntro")),
        h(
          "form",
          {
            onSubmit: (event) => {
              event.preventDefault();
              void prepare();
            },
          },
          h("label", { for: "note" }, t("messageLabel")),
          note,
          h("label", { for: "address" }, t("addressLabel")),
          address,
          h("button", { type: "submit", class: "primary", disabled: state.busy }, t(state.busy ? "preparing" : "prepareMessage")),
        ),
        draftView(),
      ].filter((node) => node !== null),
    );
  }

  return { root, render };
}
