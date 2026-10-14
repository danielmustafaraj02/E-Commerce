/** Uploads one image through /api/admin/upload and returns its URL, or an error
 *  message fit to show the admin. */
export async function uploadImage(file: File): Promise<{ url: string } | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return { error: data.error ?? "Upload failed." };
    return { url: data.url };
  } catch {
    return { error: "Upload failed. Check your connection." };
  }
}
