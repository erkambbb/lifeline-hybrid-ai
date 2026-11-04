export interface Source {
  name: string;
  url: string;
}

/** Bilgi kartlarının dayandığı kaynaklar. Ayrıntı: src/content/LICENSE.md */
export const SOURCES = {
  ifrc: {
    name: "IFRC First Aid Guidelines 2020",
    url: "https://www.ifrc.org/document/international-first-aid-resuscitation-and-education-guidelines",
  },
  akom: {
    name: "İBB AKOM",
    url: "https://akom.ibb.istanbul/afet-egitimleri/",
  },
  afad: {
    name: "AFAD",
    url: "https://istanbul.afad.gov.tr/deprem-sirasinda-hayat-kurtaran-uc-hareket-cok-kapan-tutun",
  },
  cdc: {
    name: "CDC",
    url: "https://www.cdc.gov/earthquakes/safety/stay-safe-after-an-earthquake.html",
  },
  redcross: {
    name: "American Red Cross",
    url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/earthquake.html",
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
