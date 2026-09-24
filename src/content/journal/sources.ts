import type { Source } from "@/lib/journal/types";

// Sources consulted for the journal, shared between articles. Each was read
// on the date given; `usedFor` is filled in per article.
const ACCESSED = "2026-09-24";
const MUVE = "Fondazione Musei Civici di Venezia, Museo del Vetro, Murano";

export const MUSEUM_GALLERY_GUIDE: Omit<Source, "usedFor"> = {
  title: "Glass Museum of Murano: room-by-room gallery guide (English)",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/wp-content/uploads/2020/09/SCHEDE-DI-SALA-Museo-del-Vetro-ENG-OK.pdf",
  accessed: ACCESSED,
};

export const MUSEUM_BUILDING: Omit<Source, "usedFor"> = {
  title: "Building and history",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/museum/la-sede-e-la-storia-2/",
  accessed: ACCESSED,
};

export const MUSEUM_FOUNDING: Omit<Source, "usedFor"> = {
  title: "Le musée et les collections",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/fr/le-musee/le-musee-et-les-collections/",
  accessed: ACCESSED,
};

export const MUSEUM_COLLECTION: Omit<Source, "usedFor"> = {
  title: "Glass Museum",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/museum/",
  accessed: ACCESSED,
};

export const MUSEUM_SECTIONS: Omit<Source, "usedFor"> = {
  title: "History of Murano Glass: sections",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/sections/",
  accessed: ACCESSED,
};

export const MUSEUM_BEADS: Omit<Source, "usedFor"> = {
  title: "Venetian beads",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/venetian-beads/",
  accessed: ACCESSED,
};

export const MUSEUM_CONTERIE: Omit<Source, "usedFor"> = {
  title: "Conterie space",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/the-conterie-space/",
  accessed: ACCESSED,
};

export const MUSEUM_GLOSSARY: Omit<Source, "usedFor"> = {
  title: "Glossary",
  publisher: MUVE,
  url: "https://museovetro.visitmuve.it/en/il-museo/in-depth/glossary/",
  accessed: ACCESSED,
};

export const PROMOVETRO_MARK: Omit<Source, "usedFor"> = {
  title: "The Vetro Artistico® Murano mark",
  publisher: "Consorzio Promovetro Murano",
  url: "https://promovetro.com/en/the-vetro-artistico-di-murano-mark-2/",
  accessed: ACCESSED,
};

export const VENETO_MARK: Omit<Source, "usedFor"> = {
  title: "Murano artistic glass",
  publisher: "Regione del Veneto",
  url: "https://www.regione.veneto.it/web/attivita-produttive/vetro-artistico-murano-inglese",
  accessed: ACCESSED,
};

export const CCI_GLASS_CARE: Omit<Source, "usedFor"> = {
  title: "Care of Ceramics and Glass (CCI Notes 5/1)",
  publisher: "Canadian Conservation Institute",
  url: "https://www.canada.ca/en/conservation-institute/services/conservation-preservation-publications/canadian-conservation-institute-notes/care-ceramics-glass.html",
  published: "1990, revised 2007",
  accessed: ACCESSED,
};

export const OWN_PHOTO = { credit: "Perla Murano Glass", license: "own-photography" } as const;
