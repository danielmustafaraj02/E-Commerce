import { put } from "@vercel/blob";
import sharp from "sharp";
import { auth } from "@/auth";
import { getLocalAdminSession } from "@/lib/admin-session";
import { writeAuditLog } from "@/lib/audit-log";

// Product photo upload for Admin > Products. Staff-only (the proxy gate does not
// cover route handlers, so the role and MFA are checked here), images only, and
// size-capped. Files go to Vercel Blob, whose host is already on the image
// optimizer allowlist (src/lib/image-hosts.ts). Without BLOB_READ_WRITE_TOKEN
// the route says so instead of failing obscurely, and URL entry keeps working.
//
// Every upload is decoded and re-encoded here (see prepare()), so a file that
// isn't really an image never reaches storage, and camera photos can be sent
// as they are: they are scaled down and stripped of EXIF/GPS data.
const MAX_BYTES = 20 * 1024 * 1024;
// Decompression-bomb guard: a small file can claim an enormous canvas.
const MAX_PIXELS = 50_000_000;
const MAX_EDGE = 2560;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

/** The stored version of an upload: at most 2560px on its long side, upright,
 *  without metadata, as WebP. Pictures with see-through areas stay PNG, so a
 *  logo keeps its transparency in e-mails (desktop Outlook shows no WebP). */
async function prepare(input: Buffer) {
  const open = () => sharp(input, { limitInputPixels: MAX_PIXELS });
  const meta = await open().metadata();
  const transparent = !!meta.hasAlpha && !(await open().stats()).isOpaque;
  const image = open()
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  if (transparent) {
    return { body: await image.png({ compressionLevel: 9 }).toBuffer(), ext: "png", type: "image/png" };
  }
  const opaque = meta.hasAlpha ? image.removeAlpha() : image;
  return {
    body: await opaque.webp({ quality: 86, effort: 5, smartSubsample: true }).toBuffer(),
    ext: "webp",
    type: "image/webp",
  };
}

export async function POST(request: Request) {
  const session = (await getLocalAdminSession()) ?? (await auth());
  const role = session?.user?.role;
  if (role !== "admin" && role !== "staff") return json({ error: "Not allowed." }, 401);
  if (!session?.user?.mfaEnabled)
    return json({ error: "Set up two-factor authentication first." }, 403);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(
      {
        error:
          "Photo storage is not set up yet. Connect Vercel Blob to enable uploads, or paste a URL.",
      },
      503
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "No file received." }, 400);

  if (!TYPES.has(file.type)) return json({ error: "Use a JPG, PNG, WebP or AVIF image." }, 415);
  if (file.size > MAX_BYTES) return json({ error: "That image is over 20 MB." }, 413);

  let prepared: Awaited<ReturnType<typeof prepare>>;
  try {
    prepared = await prepare(Buffer.from(await file.arrayBuffer()));
  } catch {
    return json({ error: "That file could not be read as an image, or it is too large." }, 415);
  }

  // The name is only a readable hint; the random suffix makes it unguessable and unique.
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "photo";

  try {
    const blob = await put(`products/${base}.${prepared.ext}`, prepared.body, {
      access: "public",
      addRandomSuffix: true,
      contentType: prepared.type,
    });
    await writeAuditLog({
      userId: session.user.id,
      action: "product.image.upload",
      entityType: "ProductImage",
      after: { url: blob.url, bytes: prepared.body.length, uploadedBytes: file.size },
    });
    return json({ url: blob.url }, 200);
  } catch (error) {
    console.error("Product image upload failed", error instanceof Error ? error.message : error);
    return json({ error: "Upload failed. Try again." }, 502);
  }
}
