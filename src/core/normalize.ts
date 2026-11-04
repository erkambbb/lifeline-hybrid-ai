const TURKISH_LETTERS: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
};

/**
 * Metni aramaya uygun hale getirir: küçük harf, Türkçe karakter sadeleştirme.
 * NEDEN: Panik halindeki biri Türkçe karakter kullanmadan yazabilir.
 * "bacağım sıkıştı" ile "bacagim sikisti" aynı sonucu vermelidir.
 */
export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (letter) => TURKISH_LETTERS[letter] ?? letter)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
