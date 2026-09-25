"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GiftCardBackFace, GiftCardPreview } from "@/components/gift-card-preview";
import { BACK_ART, LOGO_MARK_SRC } from "@/lib/gift-card-art";
import type { GiftCardBack, GiftCardFont, GiftCardSticker } from "@/lib/gift-card";
import type { CardScene } from "@/lib/gift-card-3d-scene";
import "./gift-card.css";

// A card with two faces that turns over in CSS: the designer's live preview,
// and the 3D card's stand-in until (or instead of) WebGL.
export function GiftCardFlip({
  front,
  back,
  showBack,
  className = "",
}: {
  front: ReactNode;
  back: ReactNode;
  showBack: boolean;
  className?: string;
}) {
  return (
    <div className={`gc-flip ${className}`} data-back={showBack}>
      <div className="gc-flip-inner">
        <div className="gc-flip-face" aria-hidden={showBack}>
          {front}
        </div>
        <div className="gc-flip-face gc-flip-face--back" aria-hidden={!showBack}>
          {back}
        </div>
      </div>
    </div>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

// The card in 3D (three.js, built in lib/gift-card-3d-scene.ts), facing the
// viewer; the button turns it over to show the logo on the back. The HTML card is rendered first — it's what the server sends, what
// shows without WebGL, and where the canvas reads its fonts from — and the
// 3D card replaces it once the card scrolls near.
export function GiftCard3D({
  lines,
  font,
  brand,
  stickers = [],
  back = "ivory",
  labels,
}: {
  lines: string[];
  font: GiftCardFont;
  brand: string;
  stickers?: GiftCardSticker[];
  back?: GiftCardBack;
  labels: { seeBack: string; seeFront: string };
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CardScene | null>(null);
  const [ready, setReady] = useState(false);
  const [showBack, setShowBack] = useState(false);

  // Mount the scene once the card is about to be seen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !supportsWebGL()) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const { mountCardScene } = await import("@/lib/gift-card-3d-scene");
        if (cancelled) return;
        sceneRef.current = mountCardScene(stage, {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onFaceChange: setShowBack,
        });
      },
      { rootMargin: "300px" }
    );
    observer.observe(stage);
    return () => {
      cancelled = true;
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // (Re)print the faces whenever the card's content changes.
  const content = JSON.stringify({ lines, font, brand, stickers, back });
  useEffect(() => {
    let cancelled = false;
    const paint = async () => {
      // Wait for the scene to exist (it mounts on scroll).
      while (!sceneRef.current) {
        if (cancelled) return;
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      const fallback = fallbackRef.current;
      if (!fallback) return;
      const family = (selector: string) =>
        getComputedStyle(fallback.querySelector(selector) ?? fallback).fontFamily;
      const faces = {
        brand: family(".gc-card-brand"),
        message: family(".gc-card-text"),
        foot: family(".gc-card-foot"),
      };
      // Fonts are best effort: a face that fails to load (a blocked subset,
      // a flaky network) just draws in its fallback.
      const loadFont = (spec: string, text: string) =>
        document.fonts.load(spec, text).catch(() => []);
      const [{ drawFront, drawBack }, logo] = await Promise.all([
        import("@/lib/gift-card-canvas"),
        loadImage(LOGO_MARK_SRC),
        loadFont(`40px ${faces.message}`, lines.join(" ") || "A"),
        loadFont(`500 20px ${faces.brand}`, brand),
        loadFont(`italic 20px ${faces.foot}`, "Murano"),
      ]);
      if (cancelled || !sceneRef.current) return;
      sceneRef.current.setFaces(
        drawFront({ lines, font, brand, stickers, faces }),
        drawBack(back, logo),
        BACK_ART[back].edge
      );
      setReady(true);
    };
    paint().catch(() => {
      // The HTML card stays; nothing else to do.
    });
    return () => {
      cancelled = true;
    };
    // `content` stands for every input to the drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const flip = () => {
    if (sceneRef.current && ready) sceneRef.current.flip();
    else setShowBack(!showBack);
  };

  return (
    <div className="gc3d">
      <div ref={stageRef} className="gc3d-stage" data-ready={ready}>
        <div ref={fallbackRef} className="gc3d-fallback">
          <GiftCardFlip
            showBack={showBack}
            front={<GiftCardPreview lines={lines} font={font} brand={brand} stickers={stickers} />}
            back={<GiftCardBackFace back={back} />}
          />
        </div>
      </div>
      <div className="gc3d-controls">
        <button type="button" className="gc3d-flip" onClick={flip}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path
              d="M3.5 8.5a6.5 6.5 0 0 1 12-2.5M16.5 11.5a6.5 6.5 0 0 1-12 2.5M15.5 2.5v3.5H12M4.5 17.5V14H8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {showBack ? labels.seeFront : labels.seeBack}
        </button>
      </div>
    </div>
  );
}
