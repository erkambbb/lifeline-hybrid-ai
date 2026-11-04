import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "@fontsource/atkinson-hyperlegible/latin-ext-400.css";
import "@fontsource/atkinson-hyperlegible/latin-ext-700.css";
import { registerSW } from "virtual:pwa-register";
import type { Layer } from "./core/triage";
import { getLang, setLang, t, translatePage, type MessageKey } from "./i18n";
import "./style.css";
import { h } from "./ui/dom";
import { createEmergencyView } from "./ui/emergency";
import { createMessageView } from "./ui/message";
import { createPrepareView } from "./ui/prepare";
import { notifyStatus, onStatusChange, refreshStatus, status } from "./ui/status";

type Tab = "emergency" | "message" | "prepare";

const TABS: { id: Tab; label: MessageKey }[] = [
  { id: "emergency", label: "tabEmergency" },
  { id: "message", label: "tabMessage" },
  { id: "prepare", label: "tabPrepare" },
];

const app = document.getElementById("app");
if (!app) throw new Error("#app bulunamadı");

let activeTab: Tab = "emergency";
let activeLayer: Layer | null = null;

const emergency = createEmergencyView((layer) => {
  activeLayer = layer;
  renderShell();
});
const message = createMessageView();
const prepare = createPrepareView();
const views = { emergency, message, prepare };

const header = h("header", { class: "top" });
const strip = h("div", { class: "strip", role: "status" });
const main = h("main", {});
const footer = h("footer", { class: "dock" });
app.append(header, strip, main, footer);

/** Katman şeridi: hangi katmanın şu an çalışabildiğini bir bakışta gösterir. */
function renderStrip(): void {
  const layers: { id: Layer; label: MessageKey; on: boolean }[] = [
    { id: "in_cloud", label: "layerCloud", on: status.online && status.cloudReady },
    { id: "on_device", label: "layerDevice", on: status.device === "available" },
    { id: "library", label: "layerLibrary", on: true },
  ];
  strip.setAttribute("aria-label", t("layersLabel"));
  strip.replaceChildren(
    ...layers.map(({ id, label, on }) =>
      h(
        "span",
        { class: `layer layer-${id}${on ? " on" : ""}${activeLayer === id ? " active" : ""}` },
        t(label),
      ),
    ),
  );
}

function renderShell(): void {
  translatePage();
  header.replaceChildren(
    h("h1", {}, t("appName")),
    h(
      "button",
      {
        type: "button",
        class: "language",
        lang: getLang() === "tr" ? "en" : "tr",
        onClick: () => {
          setLang(getLang() === "tr" ? "en" : "tr");
          renderAll();
        },
      },
      t("switchLanguage"),
    ),
  );
  renderStrip();
  footer.replaceChildren(
    h("a", { class: "call", href: "tel:112" }, t("call112")),
    h(
      "nav",
      { class: "tabs" },
      ...TABS.map(({ id, label }) =>
        h(
          "button",
          {
            type: "button",
            "aria-current": id === activeTab ? "page" : undefined,
            onClick: () => {
              activeTab = id;
              renderAll();
              window.scrollTo(0, 0);
            },
          },
          t(label),
        ),
      ),
    ),
  );
}

function renderAll(): void {
  renderShell();
  const view = views[activeTab];
  view.render();
  main.replaceChildren(view.root);
}

function startOfflineSupport(): void {
  const markReady = (): void => {
    status.serviceWorker = "swReady";
    notifyStatus();
  };
  registerSW({
    immediate: true,
    onOfflineReady: markReady,
    onRegisteredSW: (_url, registration) => {
      if (registration?.active) markReady();
    },
    onRegisterError: () => {
      status.serviceWorker = "swFailed";
      notifyStatus();
    },
  });

  // Tarayıcıdan önbelleği silmemesini isteriz.
  // NEDEN: Disk dolunca tarayıcı önbelleği temizleyebilir. Afet uygulamasının
  // tam ihtiyaç anında kaybolmaması gerekir.
  void navigator.storage?.persist?.();
}

onStatusChange(() => {
  renderStrip();
  if (activeTab === "prepare") prepare.render();
});
window.addEventListener("online", () => void refreshStatus());
window.addEventListener("offline", () => void refreshStatus());

renderAll();
void refreshStatus();
startOfflineSupport();
