import type { Locale } from "@/lib/i18n/locale-constants";
import type { FaqItem } from "@/lib/faq";

/**
 * The home page's first two questions: why buy here, and what to expect from
 * glass. Facts only: Perla chooses its pieces (it does not make all of them),
 * so nothing here claims hand production; the gift box, shipping and 14-day
 * returns are stated elsewhere on the site too.
 * Italian and English; other languages use the English text.
 */
const COPY = {
  en: [
    {
      id: "why-us",
      question: "Why choose Perla?",
      answer:
        "Because we choose every piece ourselves, looking at the colour of the glass, how it sits when worn and how well it is finished. Every order arrives in our gift box, shipping is free across Italy and Europe, and you have 14 days to change your mind.",
    },
    {
      id: "unique",
      question: "Will my piece look exactly like the photo?",
      answer:
        "Very close, though not always identical. Glass beads vary slightly in shade and detail from one to the next, so two necklaces of the same design can differ a little.",
    },
  ],
  it: [
    {
      id: "why-us",
      question: "Perché scegliere Perla?",
      answer:
        "Perché ogni gioiello lo scegliamo noi, guardando il colore del vetro, come si porta e la cura delle finiture. Ogni ordine arriva nella nostra confezione regalo, la spedizione è gratuita in Italia e in Europa e hai 14 giorni per cambiare idea.",
    },
    {
      id: "unique",
      question: "Il mio gioiello sarà identico alla foto?",
      answer:
        "Molto simile, anche se non sempre identico. Le perle di vetro cambiano leggermente di tono e di dettagli l'una dall'altra, quindi due collane dello stesso modello possono differire un poco.",
    },
  ],
} satisfies Record<"en" | "it", FaqItem[]>;

export function homeValueFaq(locale: Locale): FaqItem[] {
  return locale === "it" ? COPY.it : COPY.en;
}
