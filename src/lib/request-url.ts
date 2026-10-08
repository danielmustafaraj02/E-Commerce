/** NextURL normalizes loopback addresses to localhost. Retain the incoming
 * Host for local rewrites, otherwise Next treats them as external requests
 * and runs locale redirects again on the rewritten path. */
export function requestUrl(request: { url: string; headers: Headers }): URL {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (
    url.hostname === "localhost" &&
    host &&
    /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
  )
    url.host = host;
  return url;
}
