import { afterEach, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { optimizeImages } from "./optimize-images.mjs";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "optimize-images-"));
  roots.push(root);
  mkdirSync(join(root, "public/products/rings"), { recursive: true });
  mkdirSync(join(root, "public/blog"), { recursive: true });
  return root;
}

const photo = (width: number, height: number, alpha = 1) =>
  sharp({
    create: { width, height, channels: 4, background: { r: 180, g: 40, b: 60, alpha } },
  });

const run = (root: string, archive = false) => optimizeImages(root, { archive, log: () => {} });

describe("optimizeImages", () => {
  it("converts photos to WebP, scaled to 2560px and stripped of metadata", async () => {
    const root = fixture();
    await photo(3000, 1000)
      .jpeg()
      .withMetadata({ exif: { IFD0: { Copyright: "camera" } } })
      .toFile(join(root, "public/products/rings/ring.jpg"));

    const result = await run(root);

    expect(result.converted).toBe(1);
    const meta = await sharp(join(root, "public/products/rings/ring.webp")).metadata();
    expect(meta.format).toBe("webp");
    expect(Math.max(meta.width!, meta.height!)).toBe(2560);
    expect(meta.exif).toBeUndefined();
    // Without --archive the original stays where it is.
    expect(existsSync(join(root, "public/products/rings/ring.jpg"))).toBe(true);
  }, 30_000);

  it("keeps real transparency and drops an alpha channel that is opaque everywhere", async () => {
    const root = fixture();
    await photo(64, 64, 0.5).png().toFile(join(root, "public/products/cutout.png"));
    await photo(64, 64, 1).png().toFile(join(root, "public/products/opaque.png"));

    await run(root);

    expect((await sharp(join(root, "public/products/cutout.webp")).metadata()).hasAlpha).toBe(true);
    expect((await sharp(join(root, "public/products/opaque.webp")).metadata()).hasAlpha).toBe(
      false
    );
  });

  it("archives originals and camera RAW files, and does nothing on a second run", async () => {
    const root = fixture();
    await photo(32, 32).png().toFile(join(root, "public/blog/a.png"));
    writeFileSync(join(root, "public/blog/IMG_1.CR3"), "raw");

    expect(await run(root, true)).toMatchObject({ converted: 1, archived: 2 });
    expect(existsSync(join(root, "public/blog/a.webp"))).toBe(true);
    expect(existsSync(join(root, "public/blog/a.png"))).toBe(false);
    expect(existsSync(join(root, "originals/public/blog/a.png"))).toBe(true);
    expect(existsSync(join(root, "originals/public/blog/IMG_1.CR3"))).toBe(true);

    expect(await run(root, true)).toMatchObject({ converted: 0, archived: 0 });
  });

  it("converts a photo again when it is replaced after its conversion", async () => {
    const root = fixture();
    const original = join(root, "public/products/rings/ring.png");
    await photo(32, 32).png().toFile(original);
    await run(root);
    const later = new Date(Date.now() + 60_000);
    utimesSync(original, later, later);

    expect((await run(root)).converted).toBe(1);
  });

  it("never overwrites an earlier archived copy", async () => {
    const root = fixture();
    mkdirSync(join(root, "originals/public/blog"), { recursive: true });
    writeFileSync(join(root, "originals/public/blog/a.png"), "older original");
    await photo(32, 32).png().toFile(join(root, "public/blog/a.png"));

    await run(root, true);

    expect(existsSync(join(root, "originals/public/blog/a.2.png"))).toBe(true);
  });

  it("ignores folders outside the photo folders", async () => {
    const root = fixture();
    await photo(32, 32).png().toFile(join(root, "public/logo.png"));

    expect((await run(root, true)).converted).toBe(0);
    expect(existsSync(join(root, "public/logo.png"))).toBe(true);
  });
});
