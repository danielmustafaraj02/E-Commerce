import type { Article } from "@/lib/journal/types";
import { OWN_PHOTO } from "./sources";

export const thingsToDoInMurano: Article = {
  slug: "things-to-do-in-murano",
  title: "Things to Do in Murano: A Slower Island Guide",
  seoTitle: "Things to Do in Murano: A Thoughtful Island Guide",
  description:
    "Plan a thoughtful Murano day: watch glassmaking, visit the Glass Museum and Basilica, follow a canal-side walk, and check useful transport links.",
  category: "history",
  published: "2026-09-27",
  primaryKeyword: "things to do in Murano",
  secondaryKeywords: [
    "Murano island guide",
    "Murano Glass Museum",
    "Murano glassmaking demonstrations",
    "Murano vaporetto",
  ],
  hero: {
    kind: "file",
    src: "/hero/handmade-red-murano-glass-necklace.jpg",
    alt: "Handmade red Murano glass necklace photographed by Perla Murano Glass",
    rights: OWN_PHOTO,
  },
  intro:
    "Murano is known around the world for its glass, but the island is more than a row of shop windows. Give yourself time for a furnace visit, a museum, the old lanes between the canals and a pause inside one of the lagoon’s most remarkable basilicas. Here is a gentle route, grounded in the City of Venice’s visitor itinerary, with practical links for planning your own day.",
  body: [
    {
      type: "facts",
      title: "At a glance",
      items: [
        "Watch glass being worked at a participating furnace; demonstrations and access vary, so check ahead.",
        "The Glass Museum traces the island’s glassmaking history through historic and contemporary works.",
        "Walk Fondamenta dei Vetrai to the Basilica of Santi Maria e Donato, then continue towards Campo Santo Stefano.",
        "Check current vaporetto times before travelling: routes and timetables can change.",
      ],
    },
    { type: "h2", text: "Start with the glass" },
    {
      type: "p",
      text: "If this is your first visit, begin at the [Murano Glass Museum](https://museovetro.visitmuve.it/en/il-museo/museum/). Its collection follows the island’s glassmaking from early examples to contemporary work, giving you a richer sense of what you will see in the workshops and studios outside. Check the museum’s [tickets and visitor information](https://museovetro.visitmuve.it/en/pianifica-la-tua-visita/tickets/) before you go, since opening details and entry arrangements can change.",
    },
    {
      type: "p",
      text: "Seeing a glassworker at the furnace brings the material to life: a glowing gather of glass can become a vessel or a bead through a sequence of quick, practiced movements. Some Murano furnaces offer demonstrations, but each workshop sets its own schedule and conditions. Ask before you travel, and treat a demonstration as a visit to a working craft business. For background on the techniques, read our guide to [the history of Murano glass](/blog/history-of-murano-glass) and our introduction to [Venetian glass beads](/blog/venetian-glass-beads).",
    },
    { type: "h2", text: "Take the canal-side route" },
    {
      type: "p",
      text: "From Murano Colonna, follow Fondamenta dei Vetrai at an unhurried pace. The [City of Venice’s Murano itinerary](https://www.comune.venezia.it/it/node/1648) links this canal-side walk with the island’s main sights, including Palazzo da Mula, the Glass Museum, the former Conterie bead-making area and Campo Santo Stefano. Look up as you walk: Murano’s bridges, water gates and working boat traffic are part of the visit too.",
    },
    {
      type: "p",
      text: "At Campo Santo Stefano, pause by the clock tower and take in the quieter scale of the island. The former Conterie area is a reminder that Murano’s glass story includes tiny beads and its industrial past, as well as the furnaces that make the island famous. If you have more time, continue towards Murano Faro; from there, Burano can be a separate extension to the day, subject to the current boat service.",
    },
    { type: "h2", text: "Step inside the Basilica of Santi Maria e Donato" },
    {
      type: "p",
      text: "The Basilica is one of Murano’s most memorable stops. Its medieval pavement is made from marble and coloured glass tesserae, and the [church’s visitor page](https://www.sandonatomurano.it/basilica-dei-santi-maria-e-donato) shares its history and current visiting information. Check that page before setting off, and keep the atmosphere in mind: this is a place of worship as well as a work of art.",
    },
    { type: "h2", text: "A half-day plan, with room to wander" },
    {
      type: "p",
      text: "For a relaxed half day, visit the museum first, arrange a furnace demonstration in advance, then walk the foundations towards the Basilica and Campo Santo Stefano. Leave a little unscheduled time for a coffee, a view across the canal or a closer look at the glass in a local studio. If you are comparing visitor suggestions, [Tripadvisor’s Murano attractions page](https://www.tripadvisor.it/Attractions-g681249-Activities-Murano_Veneto.html) is a useful starting point; check opening, booking and access details directly with each place.",
    },
    {
      type: "p",
      text: "For transport, use the [official ACTV navigation timetables](https://actv.avmspa.it/en/content/orari-servizio-di-navigazione-0) and check service updates on the day. The museum also lists its [directions by vaporetto](https://museovetro.visitmuve.it/en/pianifica-la-tua-visita/how-to-get-there/). Routes and frequencies vary, so plan your return before you settle in for the evening.",
    },
    {
      type: "p",
      text: "Murano rewards looking closely: at a bead’s layers, the light on the water and the details that only show up when you slow down. If you would like a small reminder of the island to take home, explore our handmade [Murano glass collection](/products). To learn what to look for when shopping, see [how to recognize authentic Murano glass](/blog/how-to-recognize-authentic-murano-glass).",
    },
    {
      type: "products",
      title: "A little Murano to take home",
      slugs: [
        "collana-notte-stellata-92b5fd",
        "bracciale-fiore-di-onice-1c6c6e",
        "orecchini-sassolino-di-onice-6bae0d",
      ],
    },
    {
      type: "cta",
      text: "Explore handmade Murano glass jewellery",
      href: "/products",
    },
  ],
  sources: [
    {
      title: "Murano: visitor itinerary",
      publisher: "City of Venice",
      url: "https://www.comune.venezia.it/it/node/1648",
      usedFor:
        "The suggested canal-side route, principal sights, glassmaking visits, Conterie area and the link towards Burano.",
      accessed: "2026-09-27",
    },
    {
      title: "Glass Museum",
      publisher: "Fondazione Musei Civici di Venezia (MUVE)",
      url: "https://museovetro.visitmuve.it/en/il-museo/museum/",
      usedFor: "The museum’s history and its glass collection, from historic to contemporary works.",
      accessed: "2026-09-27",
    },
    {
      title: "Plan your visit: tickets",
      publisher: "Fondazione Musei Civici di Venezia (MUVE)",
      url: "https://museovetro.visitmuve.it/en/pianifica-la-tua-visita/tickets/",
      usedFor: "The link to current ticket information and visitor arrangements for the Glass Museum.",
      accessed: "2026-09-27",
    },
    {
      title: "Plan your visit: how to get there",
      publisher: "Fondazione Musei Civici di Venezia (MUVE)",
      url: "https://museovetro.visitmuve.it/en/pianifica-la-tua-visita/how-to-get-there/",
      usedFor: "The museum’s directions by vaporetto and links to official transport information.",
      accessed: "2026-09-27",
    },
    {
      title: "Basilica of Santi Maria e Donato",
      publisher: "Collaborazione Pastorale di Murano",
      url: "https://www.sandonatomurano.it/basilica-dei-santi-maria-e-donato",
      usedFor:
        "The basilica’s history, glass and marble mosaic pavement, and current tourist visit information.",
      accessed: "2026-09-27",
    },
    {
      title: "Murano attractions",
      publisher: "Tripadvisor",
      url: "https://www.tripadvisor.it/Attractions-g681249-Activities-Murano_Veneto.html",
      usedFor:
        "A visitor-review directory readers can use to compare attractions and plan further stops.",
      accessed: "2026-09-27",
    },
    {
      title: "Waterborne transport timetables",
      publisher: "ACTV / AVM",
      url: "https://actv.avmspa.it/en/content/orari-servizio-di-navigazione-0",
      usedFor:
        "Official vaporetto route and timetable reference; ACTV notes that service schedules may change.",
      accessed: "2026-09-27",
    },
  ],
  related: ["history-of-murano-glass", "venetian-glass-beads"],
};
