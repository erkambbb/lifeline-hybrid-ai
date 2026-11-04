import { describe, expect, it } from "vitest";
import { composeMessage, extractFacts, mergeFacts, SMS_LIMIT, smsUri, toSmsText } from "./help-message";

describe("extractFacts", () => {
  it("reads the Turkish example from the brief", () => {
    expect(extractFacts("3 kişiyiz, annem yaralı, 2. kattayız")).toEqual({
      people: 3, injured: 1, floor: 2, trapped: false,
    });
  });

  it("reads number words and rubble", () => {
    expect(extractFacts("üç kişiyiz iki yaralı enkaz altındayız")).toEqual({
      people: 3, injured: 2, floor: null, trapped: true,
    });
  });

  it("reads special floors", () => {
    expect(extractFacts("zemin kattayız").floor).toBe(0);
    expect(extractFacts("bodrumdayız").floor).toBe(-1);
    expect(extractFacts("ikinci kat").floor).toBe(2);
  });

  it("reads English", () => {
    expect(extractFacts("3 of us, my mother is injured, 2nd floor")).toEqual({
      people: 3, injured: 1, floor: 2, trapped: false,
    });
  });

  it("leaves unknown values empty", () => {
    expect(extractFacts("yardım edin")).toEqual({ people: null, injured: null, floor: null, trapped: false });
  });
});

describe("mergeFacts", () => {
  it("fills gaps but keeps local values", () => {
    const local = { people: 3, injured: null, floor: null, trapped: false };
    expect(mergeFacts(local, { people: 9, injured: 1, trapped: true })).toEqual({
      people: 3, injured: 1, floor: null, trapped: true,
    });
    expect(mergeFacts(local, null)).toEqual(local);
  });
});

describe("toSmsText", () => {
  it("removes every non-ASCII character", () => {
    expect(toSmsText("Şükrü İĞNE çığ — 🙂")).toBe("Sukru IGNE cig");
  });
});

describe("composeMessage", () => {
  const base = {
    facts: { people: 3, injured: 1, floor: 2, trapped: true },
    note: "",
    location: { latitude: 37.57612, longitude: 36.92131 },
    address: "",
    lang: "tr" as const,
  };

  it("builds a Turkish message", () => {
    expect(composeMessage(base)).toBe(
      "YARDIM! 3 kisi, 1 yarali, kat 2, enkaz altinda. maps.google.com/?q=37.57612,36.92131",
    );
  });

  it("builds an English message", () => {
    expect(composeMessage({ ...base, lang: "en" })).toBe(
      "HELP! 3 people, 1 injured, floor 2, trapped. maps.google.com/?q=37.57612,36.92131",
    );
  });

  it("shortens the note and keeps the location", () => {
    const message = composeMessage({ ...base, note: "çok uzun bir not ".repeat(30) });
    expect(message.length).toBeLessThanOrEqual(SMS_LIMIT);
    expect(message).toContain("maps.google.com");
    expect(message).toMatch(/^[\x20-\x7e]+$/);
  });

  it("works with an address and no location", () => {
    expect(composeMessage({ ...base, location: null, address: "Atatürk Cad. No 5" })).toContain(
      "Ataturk Cad. No 5",
    );
  });
});

describe("smsUri", () => {
  it("uses the right separator for each platform", () => {
    expect(smsUri("+90 555 111 22 33", "a b", false)).toBe("sms:+905551112233?body=a%20b");
    expect(smsUri("+90 555 111 22 33", "a b", true)).toBe("sms:+905551112233&body=a%20b");
    expect(smsUri("", "a", false)).toBe("sms:?body=a");
  });
});
