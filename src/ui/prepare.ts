import { CHECKLIST } from "../content/checklist";
import { load, save } from "../core/storage";
import { createModel, downloadDeviceModel, type DeviceStatus } from "../hybrid";
import { getLang, t, type MessageKey } from "../i18n";
import { getLocation } from "../location";
import { prepareTranslator, type TranslatorStatus } from "../translate";
import { h } from "./dom";
import { refreshStatus, status } from "./status";
import { createTechnicalPanel } from "./technical";

export interface Contact {
  name: string;
  phone: string;
}

const MAX_CONTACTS = 5;

function readinessLabel(value: DeviceStatus | TranslatorStatus): MessageKey {
  if (value === "available") return "ready";
  if (value === "downloading") return "deviceDownloading";
  if (value === "downloadable") return "deviceDownloadable";
  return "notOnThisDevice";
}

export function createPrepareView() {
  const root = h("section", { class: "view" });
  const technical = createTechnicalPanel();
  let packed = load<string[]>("bag", []);
  let meeting = load<string>("meeting", "");
  let contacts = load<Contact[]>("contacts", []);
  let locationAllowed = false;
  let modelProgress: number | null = null;
  let error = "";

  // Daha önce izin verildiyse tekrar sormayız.
  void navigator.permissions?.query({ name: "geolocation" }).then((permission) => {
    locationAllowed = permission.state === "granted";
    render();
  });

  async function allowLocation(): Promise<void> {
    locationAllowed = (await getLocation()) !== null;
    render();
  }

  async function downloadTranslator(): Promise<void> {
    try {
      await prepareTranslator();
    } catch (cause) {
      error = `${t("errorDownload")}: ${String(cause)}`;
    }
    await refreshStatus();
  }

  async function downloadModel(): Promise<void> {
    error = "";
    modelProgress = 0;
    render();
    try {
      // İndirme bir tıklamayla başlamalıdır. Bu fonksiyon düğmeden çağrılır.
      await downloadDeviceModel(createModel("prefer_on_device"), (fraction) => {
        modelProgress = fraction;
        const bar = root.querySelector("progress");
        if (bar) bar.value = fraction;
      });
    } catch (cause) {
      error = `${t("errorDownload")}: ${String(cause)}`;
    }
    modelProgress = null;
    await refreshStatus();
  }

  function row(label: MessageKey, value: MessageKey, ok: boolean, action?: HTMLElement | false): HTMLElement {
    return h(
      "li",
      { class: ok ? "ready" : "" },
      h("span", { class: "item-label" }, t(label)),
      h("span", { class: "item-value" }, t(value)),
      action,
    );
  }

  function readiness(): HTMLElement {
    const canDownloadModel = status.device === "downloadable" || status.device === "downloading";
    const canDownloadTranslator = status.translator === "downloadable";
    return h(
      "div",
      { class: "block" },
      h("h2", {}, t("readinessTitle")),
      h("p", { class: "lead" }, t("readinessIntro")),
      h(
        "ul",
        { class: "readiness" },
        row("itemApp", status.serviceWorker, status.serviceWorker === "swReady"),
        row(
          "itemLocation",
          locationAllowed ? "ready" : "notGranted",
          locationAllowed,
          !locationAllowed && h("button", { type: "button", onClick: () => void allowLocation() }, t("allow")),
        ),
        row(
          "itemTranslator",
          readinessLabel(status.translator),
          status.translator === "available",
          canDownloadTranslator && h("button", { type: "button", onClick: () => void downloadTranslator() }, t("download")),
        ),
        row(
          "itemModel",
          readinessLabel(status.device),
          status.device === "available",
          canDownloadModel && modelProgress === null && h("button", { type: "button", onClick: () => void downloadModel() }, t("download")),
        ),
      ),
      modelProgress !== null && h("progress", { max: "1", value: String(modelProgress) }),
      error && h("p", { class: "error", role: "alert" }, error),
    );
  }

  function bag(): HTMLElement {
    const lang = getLang();
    const summary = h("p", { class: "lead" }, "");
    const showCount = (): void => {
      summary.textContent = `${packed.length}/${CHECKLIST.length} ${t("bagReady")}`;
    };
    showCount();
    return h(
      "div",
      { class: "block" },
      h("h2", {}, t("bagTitle")),
      summary,
      h(
        "ul",
        { class: "checklist" },
        ...CHECKLIST.map((item) => {
          const box = h("input", {
            type: "checkbox",
            onChange: () => {
              packed = box.checked ? [...packed, item.id] : packed.filter((id) => id !== item.id);
              save("bag", packed);
              showCount();
            },
          });
          box.checked = packed.includes(item.id);
          return h("li", {}, h("label", {}, box, h("span", {}, item.label[lang])));
        }),
      ),
    );
  }

  function saveContacts(): void {
    save("contacts", contacts);
  }

  function contactRow(contact: Contact, index: number): HTMLElement {
    const name = h("input", {
      type: "text",
      "aria-label": t("contactName"),
      placeholder: t("contactName"),
      onInput: () => {
        contact.name = name.value;
        saveContacts();
      },
    });
    name.value = contact.name;
    const phone = h("input", {
      type: "tel",
      "aria-label": t("contactPhone"),
      placeholder: t("contactPhone"),
      onInput: () => {
        contact.phone = phone.value;
        saveContacts();
      },
    });
    phone.value = contact.phone;
    return h(
      "li",
      { class: "contact" },
      name,
      phone,
      h(
        "button",
        {
          type: "button",
          onClick: () => {
            contacts = contacts.filter((_item, position) => position !== index);
            saveContacts();
            render();
          },
        },
        t("removeContact"),
      ),
    );
  }

  function plan(): HTMLElement {
    const point = h("input", {
      id: "meeting",
      type: "text",
      placeholder: t("meetingPlaceholder"),
      onInput: () => {
        meeting = point.value;
        save("meeting", meeting);
      },
    });
    point.value = meeting;
    return h(
      "div",
      { class: "block" },
      h("h2", {}, t("planTitle")),
      h("label", { for: "meeting" }, t("meetingLabel")),
      point,
      h("h3", {}, t("contactsTitle")),
      h("ul", { class: "contacts" }, ...contacts.map(contactRow)),
      contacts.length < MAX_CONTACTS &&
        h(
          "button",
          {
            type: "button",
            onClick: () => {
              contacts = [...contacts, { name: "", phone: "" }];
              saveContacts();
              render();
            },
          },
          t("addContact"),
        ),
    );
  }

  function render(): void {
    root.replaceChildren(readiness(), bag(), plan(), technical.root);
    technical.render();
  }

  return { root, render };
}

