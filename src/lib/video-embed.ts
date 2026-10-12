// Kept apart from the article schema (journal/article-schema.ts), which is built
// on zod: page-builder sections render videos in the browser too, and should
// not bring the whole validation library with them.

/** The iframe URL for a YouTube or Vimeo link, or null for anything else. */
export function videoEmbedUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");
  const id = (value: string | null | undefined, pattern: RegExp) =>
    value && pattern.test(value) ? value : null;
  if (host === "youtu.be") {
    const v = id(u.pathname.slice(1), /^[\w-]{11}$/);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v =
      id(u.searchParams.get("v"), /^[\w-]{11}$/) ??
      id(u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})$/)?.[1], /^[\w-]{11}$/);
    return v && `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = id(u.pathname.match(/(\d{6,})$/)?.[1], /^\d+$/);
    return v && `https://player.vimeo.com/video/${v}`;
  }
  return null;
}
