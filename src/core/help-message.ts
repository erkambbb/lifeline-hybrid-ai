import type { Lang } from "../i18n";
import { normalize } from "./normalize";

/** Yardım mesajına giren yapılandırılmış bilgiler. Bilinmeyen alan null kalır. */
export interface HelpFacts {
  people: number | null;
  injured: number | null;
  floor: number | null;
  trapped: boolean;
}

export interface MessageInput {
  facts: HelpFacts;
  note: string;
  location: { latitude: number; longitude: number } | null;
  address: string;
  lang: Lang;
}

// Tek SMS sınırı. Daha uzun mesaj parçalanır ve zayıf şebekede gitmeyebilir.
export const SMS_LIMIT = 160;

const NUMBER_WORDS: Record<string, number> = {
  bir: 1, iki: 2, uc: 3, dort: 4, bes: 5, alti: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const NUMBER = `(\\d+|${Object.keys(NUMBER_WORDS).join("|")})`;
const ORDINAL_WORDS: Record<string, number> = {
  birinci: 1, ikinci: 2, ucuncu: 3, dorduncu: 4, besinci: 5, altinci: 6, yedinci: 7, sekizinci: 8,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
};

function toNumber(value: string): number {
  return /^\d+$/.test(value) ? Number(value) : (NUMBER_WORDS[value] ?? 0);
}

function findPeople(text: string): number | null {
  const match =
    text.match(new RegExp(`(?:^| )${NUMBER} (?:kisi|people|persons?)`)) ??
    text.match(new RegExp(`(?:^| )${NUMBER} of us`));
  return match?.[1] ? toNumber(match[1]) : null;
}

function findInjured(text: string): number | null {
  const counted = text.match(new RegExp(`(?:^| )${NUMBER} (?:yarali|injured|hurt|wounded)`));
  if (counted?.[1]) return toNumber(counted[1]);
  return /(^| )(yarali|kaniyor|kirik|kirildi|injured|hurt|bleeding)/.test(text) ? 1 : null;
}

function findFloor(text: string): number | null {
  if (/(^| )(zemin kat|ground floor)/.test(text)) return 0;
  if (/(^| )(bodrum|basement)/.test(text)) return -1;
  const numbered =
    text.match(/(?:^| )(\d+) ?(?:kat|floor)/) ??
    text.match(/(?:^| )(\d+)(?:st|nd|rd|th) floor/) ??
    text.match(/(?:^| )floor (\d+)/);
  if (numbered?.[1]) return Number(numbered[1]);
  const ordinal = text.match(new RegExp(`(?:^| )(${Object.keys(ORDINAL_WORDS).join("|")}) (?:kat|floor)`));
  return ordinal?.[1] ? (ORDINAL_WORDS[ordinal[1]] ?? null) : null;
}

/** Dağınık anlatımdan bilgileri modelsiz çıkarır. Model yoksa tek yol budur. */
export function extractFacts(text: string): HelpFacts {
  const query = normalize(text);
  return {
    people: findPeople(query),
    injured: findInjured(query),
    floor: findFloor(query),
    trapped: /(^| )(enkaz|sikis|mahsur|trapped|rubble|debris|stuck)/.test(query),
  };
}

/** Yerel sonuçtaki boşlukları model sonucuyla doldurur. Yerel sonuç önceliklidir. */
export function mergeFacts(local: HelpFacts, model: Partial<HelpFacts> | null): HelpFacts {
  return {
    people: local.people ?? model?.people ?? null,
    injured: local.injured ?? model?.injured ?? null,
    floor: local.floor ?? model?.floor ?? null,
    trapped: local.trapped || model?.trapped === true,
  };
}

const SMS_LETTERS: Record<string, string> = {
  ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I", ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
};

/**
 * Metni düz ASCII'ye çevirir.
 * NEDEN: Tek bir Türkçe karakter mesajı Unicode'a çevirip sınırı 160'tan 70'e
 * düşürebilir. Afette mesajın tek parça gitmesi, harflerden önemlidir.
 */
export function toSmsText(text: string): string {
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (letter) => SMS_LETTERS[letter] ?? letter)
    .normalize("NFD")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function factsPhrase(facts: HelpFacts, lang: Lang): string {
  const parts: string[] = [];
  if (lang === "tr") {
    if (facts.people !== null) parts.push(`${facts.people} kisi`);
    if (facts.injured !== null) parts.push(`${facts.injured} yarali`);
    if (facts.floor !== null) parts.push(`kat ${facts.floor}`);
    if (facts.trapped) parts.push("enkaz altinda");
  } else {
    if (facts.people !== null) parts.push(`${facts.people} people`);
    if (facts.injured !== null) parts.push(`${facts.injured} injured`);
    if (facts.floor !== null) parts.push(`floor ${facts.floor}`);
    if (facts.trapped) parts.push("trapped");
  }
  return parts.join(", ");
}

/**
 * Mesajı kurar. Sıra önemli: yardım sözü, olgular, konum, en son serbest not.
 * NEDEN: Yer biterse kısalan kısım konum değil, not olmalıdır.
 */
export function composeMessage({ facts, note, location, address, lang }: MessageInput): string {
  const head = lang === "tr" ? "YARDIM!" : "HELP!";
  const phrase = factsPhrase(facts, lang);
  const place = location
    ? `maps.google.com/?q=${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`
    : "";
  const fixed = [head, phrase && `${phrase}.`, toSmsText(address).slice(0, 60), place]
    .filter(Boolean)
    .join(" ");
  const room = SMS_LIMIT - fixed.length - 1;
  const trimmedNote = room > 10 ? toSmsText(note).slice(0, room).trim() : "";
  return [fixed, trimmedNote].filter(Boolean).join(" ");
}

/** Mesaj uygulamasını hazır metinle açan bağlantı. Gönderme kararı kullanıcınındır. */
export function smsUri(phone: string, body: string, isIOS: boolean): string {
  const number = phone.replace(/[^\d+]/g, "");
  // RFC 5724 "?body=" der ama iOS uzun süredir "&body=" bekliyor.
  return `sms:${number}${isIOS ? "&" : "?"}body=${encodeURIComponent(body)}`;
}
