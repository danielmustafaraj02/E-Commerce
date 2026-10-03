import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit-log";

// Product photo upload for Admin > Products. Staff-only (the proxy gate does not
// cover route handlers, so the role and MFA are checked here), images only, and
// size-capped. Files go to Vercel Blob, whose host is already on the image
// optimizer allowlist (src/lib/image-hosts.ts). Without BLOB_READ_WRITE_TOKEN
// the route says so instead of failing obscurely, and URL entry keeps working.
const MAX_BYTES = 6 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

export async function POST(request: Request) {
  const session = await auth();
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

  const ext = TYPES[file.type];
  if (!ext) return json({ error: "Use a JPG, PNG, WebP or AVIF image." }, 415);
  if (file.size > MAX_BYTES) return json({ error: "That image is over 6 MB." }, 413);

  // The name is only a readable hint; the random suffix makes it unguessable and unique.
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "photo";

  try {
    const blob = await put(`products/${base}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    await writeAuditLog({
      userId: session.user.id,
      action: "product.image.upload",
      entityType: "ProductImage",
      after: { url: blob.url, bytes: file.size },
    });
    return json({ url: blob.url }, 200);
  } catch (error) {
    console.error("Product image upload failed", error instanceof Error ? error.message : error);
    return json({ error: "Upload failed. Try again." }, 502);
  }
}
