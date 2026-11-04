import { isFirebaseConfigured } from "../firebase";
import { getDeviceStatus, type DeviceStatus } from "../hybrid";
import type { MessageKey } from "../i18n";
import { getTranslatorStatus, type TranslatorStatus } from "../translate";

/** Ekranların ortak kullandığı sistem durumu. */
export interface SystemStatus {
  online: boolean;
  serviceWorker: MessageKey;
  device: DeviceStatus;
  translator: TranslatorStatus;
  cloudReady: boolean;
}

export const status: SystemStatus = {
  online: navigator.onLine,
  serviceWorker: import.meta.env.DEV ? "swDev" : "swInstalling",
  device: "unsupported",
  translator: "unsupported",
  cloudReady: isFirebaseConfigured,
};

const listeners: (() => void)[] = [];

export function onStatusChange(listener: () => void): void {
  listeners.push(listener);
}

export function notifyStatus(): void {
  for (const listener of listeners) listener();
}

/** Tarayıcıya modellerin durumunu yeniden sorar. */
export async function refreshStatus(): Promise<void> {
  status.online = navigator.onLine;
  [status.device, status.translator] = await Promise.all([getDeviceStatus(), getTranslatorStatus()]);
  notifyStatus();
}
