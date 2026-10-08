import type { ReactNode } from "react";
import { Link } from "@/components/localized-link";
import { CatalogImage } from "@/components/catalog-image";
import type { LookView } from "@/lib/look-data";
import {
  LookCta,
  LookEyebrow,
  LookJewelry,
  LookPrice,
  LookTitle,
  lookParts,
  type LookLabels,
} from "./look-editorial-parts";

export type LookTemplateProps = {
  look: LookView;
  locale: string;
  index: number;
  labels: LookLabels;
  priority?: boolean;
  heading?: "h2" | "h3";
};
type Parts = ReturnType<typeof lookParts>;

/** The source order is also the phone reading order: heading, jewellery,
 * description, price and action. Each template composes the same catalogue
 * parts, with one purchase group and no repeated product imagery. */
function Spread({
  props,
  className,
  ornament,
  visual,
}: {
  props: LookTemplateProps;
  className: string;
  ornament?: ReactNode;
  visual?: (parts: Parts) => ReactNode;
}) {
  const { look, labels, locale, index, priority, heading } = props;
  const parts = lookParts(look, labels, locale);
  const titleId = `look-title-${look.id}-${className}`;
  return (
    <article className={`look-tpl ${className}`} aria-labelledby={titleId}>
      {ornament}
      <div className="look-tpl-spread">
        <header className="look-tpl-heading" data-editorial-part>
          <LookEyebrow parts={parts} index={index} className="look-tpl-index" />
          <LookTitle
            look={look}
            parts={parts}
            id={titleId}
            heading={heading}
            className="look-tpl-title"
          />
          <span className="look-tpl-rule" aria-hidden="true" />
        </header>
        <div className="look-tpl-visual" data-editorial-part>
          {visual ? visual(parts) : <LookJewelry look={look} parts={parts} priority={priority} />}
        </div>
        <div className="look-tpl-purchase" data-editorial-part>
          <p className="look-tpl-desc">{labels.description ?? ""}</p>
          <LookPrice parts={parts} className="look-tpl-price" />
          <LookCta parts={parts} />
        </div>
      </div>
    </article>
  );
}

export function LookXxl(props: LookTemplateProps) {
  return <Spread props={props} className="look-tpl--xxl" />;
}
export function LookBotanical(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--botanical"
      ornament={
        <>
          <BotanicalBranch position="start" />
          <BotanicalBranch position="end" />
        </>
      }
    />
  );
}
export function LookCollage(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--collage"
      ornament={
        <>
          <span className="look-tpl-collage-cream" aria-hidden="true" />
          <span className="look-tpl-collage-ruby" aria-hidden="true" />
        </>
      }
    />
  );
}
/** Keep the persisted `atelier` option; only its presentation becomes quieter. */
export function LookAtelier(props: LookTemplateProps) {
  return <Spread props={props} className="look-tpl--atelier" />;
}
export function LookRunway(props: LookTemplateProps) {
  return <Spread props={props} className="look-tpl--runway" />;
}
/** Gallery keeps the existing `collector` option and independent product links. */
export function LookCollector(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--collector"
      visual={(parts) => (
        <div className="look-tpl-gallery">
          {parts.ordered.map(({ piece }, index) => (
            <Link
              key={piece.productId}
              href={`/products/${piece.slug}`}
              className={`look-tpl-plate ${index === 0 ? "look-tpl-plate--lead" : ""}`}
            >
              <span className="look-tpl-plate-img">
                {piece.imageUrl && (
                  <CatalogImage
                    src={piece.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 52rem) 30vw, 85vw"
                    loading={props.priority ? "eager" : "lazy"}
                  />
                )}
              </span>
              <span className="look-tpl-plate-caption">
                <span className="look-tpl-plate-kind">
                  {parts.labels.kinds?.[piece.kind ?? "necklace"] ?? ""}
                </span>
                <span className="look-tpl-plate-name">{piece.name}</span>
                <span className="look-tpl-plate-price">{parts.money(piece.price)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    />
  );
}
export function LookBotanicalAtelier(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--botanical-atelier"
      ornament={
        <BotanicalArt className="look-tpl-botanical-panel" src="/decor/botanical-leaves.jpg" />
      }
    />
  );
}
export function LookForestEditorial(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--forest"
      ornament={<BotanicalArt className="look-tpl-forest-art" src="/decor/botanical-seeds.jpg" />}
    />
  );
}
export function LookBotanicalCutout(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--cutout"
      ornament={
        <>
          <BotanicalArt
            className="look-tpl-cut-leaf look-tpl-cut-leaf--start"
            src="/decor/botanical-cutout.png"
          />
          <BotanicalArt
            className="look-tpl-cut-leaf look-tpl-cut-leaf--end"
            src="/decor/botanical-cutout.png"
          />
        </>
      }
    />
  );
}
export function LookCoutureCollage(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--couture"
      visual={(parts) => (
        <div
          className={`look-tpl-cout-stage ${parts.composed ? "" : "look-tpl-cout-stage--photo"}`}
        >
          <span className="look-tpl-cout-sheet" aria-hidden="true" />
          <span className="look-tpl-cout-ruby" aria-hidden="true" />
          <div className="look-tpl-cout-main">
            <LookJewelry look={props.look} parts={parts} priority={props.priority} leadOnly />
          </div>
          {parts.composed && (
            <div className="look-tpl-cout-support">
              {parts.ordered.slice(1).map(({ piece }) => (
                <Link
                  key={piece.productId}
                  href={`/products/${piece.slug}`}
                  className="look-tpl-cout-card"
                >
                  <span className="look-tpl-cout-card-img">
                    {piece.imageUrl && (
                      <CatalogImage
                        src={piece.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 52rem) 18vw, 45vw"
                      />
                    )}
                  </span>
                  <span className="look-tpl-cout-card-name">{piece.name}</span>
                  <span className="look-tpl-cout-card-price">{parts.money(piece.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

export function LookModernCollageBold(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--modern-collage-bold"
      ornament={
        <>
          <span className="look-bold-disc" aria-hidden="true" />
          <span className="look-bold-semicircle" aria-hidden="true" />
          <BotanicalBranch position="end" />
        </>
      }
    />
  );
}

export function LookRunwayBold(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--runway-bold"
      ornament={
        <>
          <span className="look-bold-runway-band" aria-hidden="true" />
          <p className="look-bold-runway-word" aria-hidden="true">
            RUBINO
          </p>
        </>
      }
    />
  );
}

export function LookForestBold(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--forest-bold"
      ornament={
        <BotanicalArt className="look-bold-forest-botanical" src="/decor/botanical-cutout.png" />
      }
    />
  );
}

export function LookCoutureBold(props: LookTemplateProps) {
  return (
    <Spread
      props={props}
      className="look-tpl--couture-bold"
      ornament={
        <>
          <span className="look-bold-couture-ruby" aria-hidden="true" />
          <span className="look-bold-couture-olive" aria-hidden="true" />
        </>
      }
    />
  );
}

/** Existing artwork only. The cutout PNG already has an alpha channel. */
function BotanicalArt({ src, className }: { src: string; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      <CatalogImage
        src={src}
        alt=""
        width={src.endsWith(".png") ? 1920 : src.includes("seeds") ? 1344 : 1200}
        height={src.endsWith(".png") ? 1734 : src.includes("seeds") ? 1920 : 1200}
        sizes="240px"
        loading="lazy"
      />
    </span>
  );
}
function BotanicalBranch({ position }: { position: "start" | "end" }) {
  return (
    <svg
      className={`look-tpl-branch look-tpl-branch--${position}`}
      viewBox="0 0 120 240"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M60 240 C60 170 58 110 62 20" fill="none" stroke="currentColor" strokeWidth="1" />
      {[36, 72, 108, 144, 180].map((y) => (
        <g key={y}>
          <path
            d={`M60 ${y} C40 ${y - 14} 22 ${y - 10} 12 ${y - 26}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d={`M60 ${y + 18} C80 ${y + 4} 98 ${y + 8} 108 ${y - 8}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      ))}
    </svg>
  );
}
