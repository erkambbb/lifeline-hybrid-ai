const PREFIX = "lifeline.";

// Depolama gizli pencerede veya dolu diskte hata verebilir.
// NEDEN try/catch: Kaydedememek can sıkıcıdır, çökmek ise tehlikeli.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Veri bu oturumda bellekte kalır.
  }
}
