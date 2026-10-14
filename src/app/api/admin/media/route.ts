import { readdir } from "node:fs/promises";
import path from "node:path";
import { list } from "@vercel/blob";
import { auth } from "@/auth";
import { getLocalAdminSession } from "@/lib/admin-session";

// The media library for the admin image pickers: site images in /public and
// photos uploaded to Vercel Blob, grouped by folder. Staff-only, read-only.
const IMAGE = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
const SKIP = new Set(["fonts", "favicon"]);

export type MediaFolder = { name: string; source: "site" | "uploads"; images: { url: string; name: string }[] };

async function walkPublic(dir: string, rel: string, out: Map<string, MediaFolder>, depth = 0) {
  if (depth > 4) return;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) await walkPublic(path.join(dir, entry.name), childRel, out, depth + 1);
    } else if (IMAGE.test(entry.name)) {
      const folder = rel || "(root)";
      if (!out.has(folder)) out.set(folder, { name: folder, source: "site", images: [] });
      out.get(folder)!.images.push({ url: `/${childRel}`, name: entry.name });
    }
  }
}

export async function GET() {
  const session = (await getLocalAdminSession()) ?? (await auth());
  const role = session?.user?.role;
  if (role !== "admin" && role !== "staff") return Response.json({ error: "Not allowed." }, { status: 401 });

  const folders = new Map<string, MediaFolder>();
  await walkPublic(path.join(process.cwd(), "public"), "", folders);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      let cursor: string | undefined;
      let pages = 0;
      do {
        const page = await list({ cursor, limit: 1000 });
        for (const blob of page.blobs) {
          if (!IMAGE.test(blob.pathname)) continue;
          const parts = blob.pathname.split("/");
          const name = parts.pop()!;
          const folder = `Uploads / ${parts.join("/") || "(root)"}`;
          if (!folders.has(folder)) folders.set(folder, { name: folder, source: "uploads", images: [] });
          folders.get(folder)!.images.push({ url: blob.url, name });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor && ++pages < 10);
    } catch (error) {
      console.error("Media library: blob list failed", error instanceof Error ? error.message : error);
    }
  }

  const sorted = [...folders.values()].sort((a, b) =>
    a.source === b.source ? a.name.localeCompare(b.name) : a.source === "uploads" ? -1 : 1
  );
  return Response.json({ folders: sorted });
}
