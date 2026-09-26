import { describe, expect, it } from "vitest";
import { TILE_SIZE, mapGrid, openStreetMapUrl, tileCoords } from "./map-tiles";

describe("tileCoords", () => {
  it("puts the equator and the prime meridian at the middle of the world", () => {
    expect(tileCoords(0, 0, 0)).toEqual({ x: 0.5, y: 0.5 });
    expect(tileCoords(0, 0, 1)).toEqual({ x: 1, y: 1 });
  });

  it("matches the published OpenStreetMap tile for San Francisco at zoom 10 (10/163/395)", () => {
    const { x, y } = tileCoords(37.7749, -122.4194, 10);
    expect(Math.floor(x)).toBe(163);
    expect(Math.floor(y)).toBe(395);
  });

  it("is reversed by the standard inverse formula (Venice)", () => {
    const zoom = 12;
    const { x, y } = tileCoords(45.4408, 12.3155, zoom);
    const n = 2 ** zoom;
    const lng = (x / n) * 360 - 180;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    expect(lat).toBeCloseTo(45.4408, 6);
    expect(lng).toBeCloseTo(12.3155, 6);
  });
});

describe("mapGrid", () => {
  it("returns a 3×3 grid whose centre tile contains the point", () => {
    const grid = mapGrid(45.4408, 12.3155, 16);
    expect(grid.tiles).toHaveLength(9);
    expect(grid.size).toBe(3 * TILE_SIZE);
    // The point sits somewhere inside the middle tile.
    expect(grid.pointX).toBeGreaterThanOrEqual(TILE_SIZE);
    expect(grid.pointX).toBeLessThan(2 * TILE_SIZE);
    expect(grid.pointY).toBeGreaterThanOrEqual(TILE_SIZE);
    expect(grid.pointY).toBeLessThan(2 * TILE_SIZE);
  });

  it("lays tiles out on a 256px grid", () => {
    const { tiles } = mapGrid(45.4408, 12.3155, 16);
    expect(new Set(tiles.map((t) => t.left))).toEqual(new Set([0, 256, 512]));
    expect(new Set(tiles.map((t) => t.top))).toEqual(new Set([0, 256, 512]));
  });

  it("wraps around the antimeridian instead of asking for a tile that doesn't exist", () => {
    const { tiles } = mapGrid(0, 179.999, 3);
    const n = 2 ** 3;
    expect(tiles.every((t) => t.x >= 0 && t.x < n)).toBe(true);
  });

  it("drops tiles that would fall off the top of the map", () => {
    const { tiles } = mapGrid(85, 0, 2);
    expect(tiles.length).toBeLessThan(9);
    expect(tiles.every((t) => t.y >= 0)).toBe(true);
  });
});

describe("openStreetMapUrl", () => {
  it("opens the same spot on openstreetmap.org", () => {
    expect(openStreetMapUrl(45.44, 12.31, 17)).toBe(
      "https://www.openstreetmap.org/?mlat=45.44&mlon=12.31#map=17/45.44/12.31"
    );
  });
});
