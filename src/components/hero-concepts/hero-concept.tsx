import Image from "next/image";
import type { CSSProperties } from "react";
import {
  cutoutFor,
  pieceWidth,
  wallpaperLayout,
  type ConceptId,
  type HeroConceptsConfig,
  type WallPiece,
} from "@/lib/hero-concepts/config";
import { RotatingPieces, type RotatingPiece } from "./rotating-pieces";
import "./hero-concepts.css";

export type HeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  pause: string;
  play: string;
};

/**
 * One of the three alternative home-page heroes (Admin > Settings > Hero
 * concepts). All three keep the current hero's ground, type and copy, and
 * differ only in how the jewellery is shown:
 *
 *   minimal    one large piece beside the text, floating gently
 *   rotating   small compositions of two to four pieces that take turns
 *   wallpaper  many pieces laid over the whole hero like a collage
 *
 * The layout answers to its own width (container queries), not the window's,
 * so the admin can draw a true phone and a true computer side by side. The
 * pieces are decorative (alt="" and hidden from assistive technology): the
 * heading, text and button are the content, and always sit above them.
 */
export function HeroConcept({
  concept,
  config,
  copy,
  paused = false,
  scene,
  className,
  style,
}: {
  concept: ConceptId;
  config: HeroConceptsConfig;
  copy: HeroCopy;
  /** Holds every animation where it is (the admin preview's pause). */
  paused?: boolean;
  /** Rotating only: show this scene and stay on it. */
  scene?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={["hc", className].filter(Boolean).join(" ")}
      data-concept={concept}
      data-paused={paused || undefined}
      style={style}
    >
      <div className="hc-stage">
        {concept === "wallpaper" && <Wallpaper config={config} />}
        <div className="hc-copy">
          <p className="hc-eyebrow">
            <span>{copy.eyebrow}</span>
            <span className="hc-eyebrow-rule" aria-hidden="true" />
          </p>
          <h1 className="hc-title">{copy.title}</h1>
          <p className="hc-lede">
            <em>{copy.subtitle}</em>
          </p>
          <p className="hc-cta-row">
            <a className="hc-cta" href={copy.ctaHref}>
              {copy.cta}
              <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
        {concept === "minimal" && <Minimal config={config} />}
        {concept === "rotating" && <Rotating config={config} paused={paused} scene={scene} copy={copy} />}
      </div>
    </section>
  );
}

function Minimal({ config }: { config: HeroConceptsConfig }) {
  const m = config.minimal;
  const cutout = cutoutFor(m.slug);
  if (!cutout) return <div className="hc-media" aria-hidden="true" />;
  const w = pieceWidth(cutout, m.size);
  return (
    <div className="hc-media" aria-hidden="true">
      <div
        className="hc-piece hc-min-piece"
        style={
          {
            left: `${m.x}%`,
            top: `${m.y}%`,
            "--w": w,
            "--ar": cutout.width / cutout.height,
            "--r": `${m.rotate}deg`,
            "--k": m.intensity / 100,
          } as CSSProperties
        }
        data-float={m.float || undefined}
      >
        <div className="hc-float">
          <Image
            src={cutout.src}
            width={cutout.width}
            height={cutout.height}
            alt=""
            quality={90}
            sizes={`(min-width: 768px) ${Math.ceil(w * 0.55)}vw, ${Math.ceil(w)}vw`}
            loading="eager"
            fetchPriority="high"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

function Rotating({
  config,
  paused,
  scene,
  copy,
}: {
  config: HeroConceptsConfig;
  paused: boolean;
  scene?: number;
  copy: HeroCopy;
}) {
  const r = config.rotating;
  const scenes = r.scenes
    .map((scene) =>
      scene.pieces.flatMap((piece): RotatingPiece[] => {
        const cutout = cutoutFor(piece.slug);
        return cutout
          ? [
              {
                src: cutout.src,
                width: cutout.width,
                height: cutout.height,
                x: piece.x,
                y: piece.y,
                w: pieceWidth(cutout, piece.size),
                rotate: piece.rotate,
              },
            ]
          : [];
      })
    )
    .filter((pieces) => pieces.length > 0);
  return (
    <div className="hc-media" style={{ "--k": r.intensity / 100 } as CSSProperties}>
      <RotatingPieces
        scenes={scenes}
        seconds={r.seconds}
        styleName={r.style}
        paused={paused}
        pin={scene}
        labels={{ pause: copy.pause, play: copy.play }}
      />
    </div>
  );
}

function Wallpaper({ config }: { config: HeroConceptsConfig }) {
  const w = config.wallpaper;
  return (
    <div className="hc-wall" aria-hidden="true" data-entrance={w.entrance || undefined}>
      <WallLayer pieces={wallpaperLayout(w, "wide")} shape="wide" />
      <WallLayer pieces={wallpaperLayout(w, "tall")} shape="tall" />
    </div>
  );
}

function WallLayer({ pieces, shape }: { pieces: WallPiece[]; shape: "wide" | "tall" }) {
  return (
    <div className={`hc-wall-layer hc-wall-${shape}`}>
      {pieces.map((piece, i) => {
        const cutout = cutoutFor(piece.slug)!;
        return (
          <div
            key={i}
            className="hc-piece hc-wall-piece"
            style={
              {
                left: `${piece.x}%`,
                top: `${piece.y}%`,
                zIndex: piece.layer,
                "--w": piece.width,
                "--r": `${piece.rotate}deg`,
                "--o": piece.opacity,
                "--i": i,
              } as CSSProperties
            }
          >
            <Image
              src={cutout.src}
              width={cutout.width}
              height={cutout.height}
              alt=""
              quality={90}
              sizes={`${Math.ceil(piece.width)}vw`}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
