import type { GiftCardBack, GiftCardFont, GiftCardSticker } from "@/lib/gift-card";
import { BACK_ART, CARD_GOLD, CARD_INK, CARD_STOCK, STICKER_ART, STICKER_SIZE } from "@/lib/gift-card-art";

// Draws the two faces of the card onto canvases for the 3D card
// (components/gift-card-3d.tsx). Measurements mirror components/gift-card.css
// for the large card (24rem wide, 4:5), scaled so 1rem = W / 24.

export const TEXTURE_WIDTH = 1024;
export const TEXTURE_HEIGHT = 1280;
const REM = TEXTURE_WIDTH / 24;

// Resolved CSS font-family lists read from the rendered HTML card, so the
// canvas uses the same next/font faces as the page.
export type CardFaces = { brand: string; message: string; foot: string };

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  return canvas;
}

function frame(ctx: CanvasRenderingContext2D, colour: string, alpha: number) {
  const inset = 0.7 * REM;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(inset, inset, TEXTURE_WIDTH - inset * 2, TEXTURE_HEIGHT - inset * 2);
  ctx.restore();
}

// Font size (rem) and line height of message line `index` of `count`,
// following the .gc-card-text rules.
function lineStyle(font: GiftCardFont, index: number, count: number) {
  const edge = count > 1 && (index === 0 || index === count - 1);
  if (font === "script") return { size: edge ? 1.4 : 1.75, leading: 1.25, weight: 400 };
  if (font === "handwritten") return { size: edge ? 1.1 : 1.5, leading: 1.35, weight: 400 };
  if (font === "modern") return { size: 1.1, leading: 1.35, weight: 300 };
  return { size: edge ? 1.1 : 1.35, leading: 1.35, weight: 400 };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const rows: string[] = [];
  for (const paragraph of text.split("\n")) {
    // Scripts written without spaces (Chinese, Japanese) wrap per character.
    const tokens = /\s/.test(paragraph) ? paragraph.split(/(\s+)/) : [...paragraph];
    let row = "";
    for (const token of tokens) {
      const next = row + token;
      if (row.trim() && ctx.measureText(next).width > maxWidth) {
        rows.push(row.trimEnd());
        row = token.trimStart();
      } else {
        row = next;
      }
    }
    rows.push(row.trimEnd());
  }
  return rows;
}

function drawSticker(ctx: CanvasRenderingContext2D, sticker: GiftCardSticker) {
  const size = STICKER_SIZE * TEXTURE_WIDTH;
  ctx.save();
  ctx.translate((sticker.x / 100) * TEXTURE_WIDTH - size / 2, (sticker.y / 100) * TEXTURE_HEIGHT - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.shadowColor = "rgba(18, 61, 67, 0.18)";
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 1.5;
  for (const layer of STICKER_ART[sticker.icon]) {
    const path = new Path2D(layer.d);
    ctx.fillStyle = layer.fill;
    ctx.fill(path);
    if (layer.stroke) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = 0.8;
      ctx.stroke(path);
    }
  }
  ctx.restore();
}

export function drawFront({
  lines,
  font,
  brand,
  stickers,
  faces,
}: {
  lines: string[];
  font: GiftCardFont;
  brand: string;
  stickers: GiftCardSticker[];
  faces: CardFaces;
}): HTMLCanvasElement {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;
  const W = TEXTURE_WIDTH;
  const H = TEXTURE_HEIGHT;

  ctx.fillStyle = CARD_STOCK;
  ctx.fillRect(0, 0, W, H);
  frame(ctx, CARD_GOLD, 0.55);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = CARD_INK;

  // House name: small spaced capitals.
  const brandSize = 0.62 * REM;
  ctx.font = `500 ${brandSize}px ${faces.brand}`;
  const tracking = 0.34 * brandSize;
  // Older browsers have no canvas letterSpacing; the name is then set solid.
  const tracked = "letterSpacing" in (ctx as object);
  if (tracked) ctx.letterSpacing = `${tracking}px`;
  // Tracking also follows the last letter; shift so the word stays centred.
  ctx.fillText(brand.toUpperCase(), W / 2 + (tracked ? tracking / 2 : 0), 2.25 * REM);
  if (tracked) ctx.letterSpacing = "0px";
  const ruleY = 2.25 * REM + brandSize * 1.5 + 0.75 * REM;
  ctx.fillStyle = CARD_GOLD;
  ctx.fillRect(W / 2 - REM, ruleY, 2 * REM, 2.5);

  // Foot line.
  const footSize = 0.85 * REM;
  const footTop = H - 1.75 * REM - footSize * 1.4;
  ctx.font = `italic ${footSize}px ${faces.foot}`;
  ctx.fillText("Murano · Venezia", W / 2, footTop);

  // The message block, centred between the rule and the foot.
  const maxWidth = W - 2 * 1.75 * REM;
  const gap = 1.1 * REM;
  const blocks = lines.map((line, index) => {
    const style = lineStyle(font, index, lines.length);
    const px = style.size * REM;
    const fontSpec = `${style.weight} ${px}px ${faces.message}`;
    ctx.font = fontSpec;
    const rows = wrap(ctx, line, maxWidth);
    return { rows, fontSpec, rowHeight: px * style.leading };
  });
  const blockHeight =
    blocks.reduce((sum, block) => sum + block.rows.length * block.rowHeight, 0) +
    gap * (blocks.length - 1);
  const areaTop = ruleY + 2.5;
  let y = areaTop + (footTop - areaTop - blockHeight) / 2;
  ctx.fillStyle = CARD_INK;
  for (const block of blocks) {
    ctx.font = block.fontSpec;
    for (const row of block.rows) {
      // Canvas "top" is the em box; centre the glyphs in their line box.
      ctx.fillText(row, W / 2, y + (block.rowHeight - block.rowHeight / 1.3) / 2);
      y += block.rowHeight;
    }
    y += gap;
  }

  for (const sticker of stickers) drawSticker(ctx, sticker);
  return canvas;
}

export function drawBack(back: GiftCardBack, logo: HTMLImageElement): HTMLCanvasElement {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;
  const art = BACK_ART[back];
  ctx.fillStyle = art.stock;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  frame(ctx, art.ink, 0.55);

  // Tint the black logo mark with the back's ink on its own canvas.
  const width = TEXTURE_WIDTH * 0.58;
  const height = (width * logo.naturalHeight) / logo.naturalWidth;
  const tinted = document.createElement("canvas");
  tinted.width = Math.round(width);
  tinted.height = Math.round(height);
  const tctx = tinted.getContext("2d")!;
  tctx.drawImage(logo, 0, 0, tinted.width, tinted.height);
  tctx.globalCompositeOperation = "source-in";
  tctx.fillStyle = art.ink;
  tctx.fillRect(0, 0, tinted.width, tinted.height);
  ctx.drawImage(tinted, (TEXTURE_WIDTH - width) / 2, (TEXTURE_HEIGHT - height) / 2);
  return canvas;
}
