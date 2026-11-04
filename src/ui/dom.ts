type Child = Node | string | null | undefined | false;
type Attributes = Record<string, string | boolean | ((event: Event) => void) | undefined>;

/**
 * Küçük bir öğe oluşturucu.
 * NEDEN innerHTML kullanmıyoruz: Kullanıcı metni ve model çıktısı güvenilmezdir.
 * Metni düğüm olarak eklemek, HTML olarak çalışmasını baştan engeller.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (typeof value === "function") node.addEventListener(name.slice(2).toLowerCase(), value);
    else if (value === true) node.setAttribute(name, "");
    else if (typeof value === "string") node.setAttribute(name, value);
  }
  for (const child of children) if (child) node.append(child);
  return node;
}
