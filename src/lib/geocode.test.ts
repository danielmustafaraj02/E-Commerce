import { describe, expect, it, vi } from "vitest";
import { GeocodeUnavailable, geocodeAddress, parseNominatim, searchUrl } from "./geocode";

const query = { street: "Via Roma 1", city: "Roma", postalCode: "00100", country: "IT" };
const ua = "Perla Murano Glass (help@example.com)";

const hit = (extra: Record<string, unknown> = {}) => ({
  lat: "41.9028",
  lon: "12.4964",
  display_name: "1, Via Roma, Roma, Lazio, 00100, Italy",
  place_rank: 30,
  ...extra,
});

function fakeFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return vi.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe("searchUrl", () => {
  it("asks for one result inside the customer's country", () => {
    const url = searchUrl(query, "https://geocoder.test");
    expect(url.origin).toBe("https://geocoder.test");
    expect(url.pathname).toBe("/search");
    expect(url.searchParams.get("q")).toBe("Via Roma 1, 00100 Roma");
    expect(url.searchParams.get("countrycodes")).toBe("it");
    expect(url.searchParams.get("limit")).toBe("1");
  });
});

describe("parseNominatim", () => {
  it("reads coordinates, the label and how exact the match is", () => {
    expect(parseNominatim([hit()])).toEqual({
      lat: 41.9028,
      lng: 12.4964,
      label: "1, Via Roma, Roma, Lazio, 00100, Italy",
      precision: "building",
    });
  });

  it.each([
    [30, "building"],
    [26, "street"],
    [16, "area"],
  ])("place_rank %i is a %s match", (rank, precision) => {
    expect(parseNominatim([hit({ place_rank: rank })])?.precision).toBe(precision);
  });

  it("returns null for no match or anything malformed or out of range", () => {
    expect(parseNominatim([])).toBeNull();
    expect(parseNominatim(null)).toBeNull();
    expect(parseNominatim({ lat: "1", lon: "2" })).toBeNull();
    expect(parseNominatim([hit({ lat: "abc" })])).toBeNull();
    expect(parseNominatim([hit({ lat: "95" })])).toBeNull();
    expect(parseNominatim([hit({ lon: "-200" })])).toBeNull();
  });
});

describe("geocodeAddress", () => {
  it("identifies the shop to the geocoder and returns the match", async () => {
    const fetchImpl = fakeFetch([hit()]);

    const result = await geocodeAddress(query, {
      userAgent: ua,
      fetchImpl,
      base: "https://g.test",
    });

    expect(result?.lat).toBe(41.9028);
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url)).toContain("https://g.test/search?");
    expect(init.headers["User-Agent"]).toBe(ua);
  });

  it("returns null, without calling the geocoder, when the address is incomplete", async () => {
    const fetchImpl = fakeFetch([hit()]);

    expect(
      await geocodeAddress({ ...query, street: "  " }, { userAgent: ua, fetchImpl })
    ).toBeNull();
    expect(
      await geocodeAddress({ ...query, country: "ITA" }, { userAgent: ua, fetchImpl })
    ).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns null when the address simply isn't found", async () => {
    expect(await geocodeAddress(query, { userAgent: ua, fetchImpl: fakeFetch([]) })).toBeNull();
  });

  it("says the geocoder is unavailable, not that the address is missing, when it fails", async () => {
    await expect(
      geocodeAddress(query, { userAgent: ua, fetchImpl: fakeFetch([], { ok: false, status: 429 }) })
    ).rejects.toBeInstanceOf(GeocodeUnavailable);

    const throwing = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    await expect(
      geocodeAddress(query, { userAgent: ua, fetchImpl: throwing })
    ).rejects.toBeInstanceOf(GeocodeUnavailable);
  });
});
