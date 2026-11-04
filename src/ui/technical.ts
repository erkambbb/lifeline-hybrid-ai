import { isFirebaseConfigured } from "../firebase";
import { ask, createModel, type DeviceStatus, type Mode } from "../hybrid";
import { t, type MessageKey } from "../i18n";
import { h } from "./dom";
import { status } from "./status";

const DEVICE_LABELS: Record<DeviceStatus, MessageKey> = {
  unsupported: "deviceUnsupported",
  unavailable: "deviceUnavailable",
  downloadable: "deviceDownloadable",
  downloading: "deviceDownloading",
  available: "deviceAvailable",
};

const SOURCE_LABELS: Record<string, MessageKey> = {
  on_device: "sourceDevice",
  in_cloud: "sourceCloud",
};

const MODES: { value: Mode; label: MessageKey }[] = [
  { value: "prefer_on_device", label: "modePreferDevice" },
  { value: "prefer_in_cloud", label: "modePreferCloud" },
  { value: "only_on_device", label: "modeOnlyDevice" },
  { value: "only_in_cloud", label: "modeOnlyCloud" },
];

export function firebaseStatusKey(): MessageKey {
  return isFirebaseConfigured ? "firebaseReady" : "firebaseMissing";
}

/** Geliştirici paneli: ham hibrit isteği atar ve kaynağı gösterir. */
export function createTechnicalPanel() {
  const root = h("details", { class: "block technical" });
  let mode: Mode = "prefer_on_device";
  let prompt: string | null = null;
  let output = "";
  let isOpen = false;

  async function send(): Promise<void> {
    output = "…";
    render();
    try {
      const answer = await ask(createModel(mode), prompt ?? t("defaultPrompt"));
      const source = t(SOURCE_LABELS[answer.source] ?? "sourceUnknown");
      output = `${source} ${answer.elapsedMs} ms\n${answer.text}`;
    } catch (error) {
      output = `${t("errorAnswer")}: ${String(error)}`;
    }
    render();
  }

  function render(): void {
    const select = h(
      "select",
      {
        id: "mode",
        onChange: () => {
          mode = select.value as Mode;
        },
      },
      ...MODES.map(({ value, label }) => h("option", { value }, t(label))),
    );
    select.value = mode;
    const input = h("textarea", {
      id: "prompt",
      rows: "2",
      onInput: () => {
        prompt = input.value;
      },
    });
    input.value = prompt ?? t("defaultPrompt");
    root.open = isOpen;
    root.replaceChildren(
      h(
        "summary",
        {
          onClick: () => {
            isOpen = !root.open;
          },
        },
        t("technicalTitle"),
      ),
      h(
        "dl",
        {},
        h("dt", {}, t("network")),
        h("dd", {}, t(status.online ? "online" : "offline")),
        h("dt", {}, t("offlineShell")),
        h("dd", {}, t(status.serviceWorker)),
        h("dt", {}, "Firebase"),
        h("dd", {}, t(firebaseStatusKey())),
        h("dt", {}, t("deviceModel")),
        h("dd", {}, t(DEVICE_LABELS[status.device])),
      ),
      h("label", { for: "mode" }, t("inferenceMode")),
      select,
      h("label", { for: "prompt" }, t("message")),
      input,
      h("button", { type: "button", onClick: () => void send() }, t("send")),
      output && h("pre", {}, output),
    );
  }

  return { root, render };
}
