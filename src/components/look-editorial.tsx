import type { LookView } from "@/lib/look-data";
import {
  LookAtelier,
  LookBotanical,
  LookBotanicalAtelier,
  LookCollage,
  LookCollector,
  LookCoutureCollage,
  LookForestEditorial,
  LookRunway,
  LookXxl,
  LookBotanicalCutout,
  LookModernCollageBold,
  LookRunwayBold,
  LookForestBold,
  LookCoutureBold,
  type LookTemplateProps,
} from "./look-editorial-templates";
import {
  LookCta,
  LookEyebrow,
  LookJewelry,
  LookPrice,
  LookTitle,
  lookParts,
  type LookLabels,
} from "./look-editorial-parts";
import { isEditorialTemplateId, type EditorialTemplateId } from "@/lib/look-templates";
import "./look-editorial.css";
import "./look-editorial-templates.css";

export function LookEditorial({
  look,
  locale,
  labels,
  index,
  priority = false,
  heading = "h3",
}: {
  look: LookView;
  locale: string;
  labels: LookLabels;
  index: number;
  priority?: boolean;
  heading?: "h2" | "h3";
}) {
  const parts = lookParts(look, labels, locale);
  const titleId = `look-title-${look.id}-editorial-${index}`;
  return (
    <article className="look-editorial" aria-labelledby={titleId}>
      <header className="look-editorial-heading" data-editorial-part>
        <LookEyebrow parts={parts} index={index} />
        <LookTitle look={look} parts={parts} id={titleId} heading={heading} />
        <span className="look-editorial-title-rule" aria-hidden="true" />
      </header>
      <div className="look-editorial-zoom" data-editorial-part>
        <LookJewelry look={look} parts={parts} priority={priority} />
      </div>
      <div className="look-editorial-copy" data-editorial-part>
        <p className="look-editorial-description">{labels.description}</p>
        <LookPrice parts={parts} />
        <LookCta parts={parts} />
      </div>
    </article>
  );
}
/**
 * Editorial templates, by persisted option value. Kept as a map so the section can
 * pick one from the stored `lookStyle` without a switch at the call site.
 */
export const EDITORIAL_TEMPLATES: Record<
  EditorialTemplateId,
  (props: LookTemplateProps) => React.ReactElement
> = {
  xxl: LookXxl,
  botanical: LookBotanical,
  collage: LookCollage,
  atelier: LookAtelier,
  runway: LookRunway,
  collector: LookCollector,
  "botanical-atelier": LookBotanicalAtelier,
  "forest-editorial": LookForestEditorial,
  "botanical-cutout": LookBotanicalCutout,
  "couture-collage": LookCoutureCollage,
  "modern-collage-bold": LookModernCollageBold,
  "runway-bold": LookRunwayBold,
  "forest-bold": LookForestBold,
  "couture-bold": LookCoutureBold,
};

export { EDITORIAL_TEMPLATE_IDS } from "@/lib/look-templates";

/**
 * Renders a look in the chosen style.
 *
 * The five original treatments are handled by CSS on the base component (their
 * markup is identical), so they need no branch here. The editorial
 * templates each have their own composition, so they are dispatched by name.
 * Anything else — including no choice at all — falls through to the shipped
 * layout, which is what keeps the default unchanged.
 */
export function LookRow({ style, ...props }: LookTemplateProps & { style?: string }) {
  const Template = style && isEditorialTemplateId(style) ? EDITORIAL_TEMPLATES[style] : undefined;
  if (Template) return <Template {...props} />;
  return <LookEditorial {...props} />;
}
