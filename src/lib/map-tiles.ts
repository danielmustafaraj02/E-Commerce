// Just enough map maths to draw a small static map from OpenStreetMap tiles with
// no map library: which 256px tiles surround a point, and where the point falls
// inside them. (Standard "slippy map" tiling, Web Mercator.)
export const TILE_SIZE = 256;

/** Fractional tile coordinates of a point at a zoom level. */
export function tileCoords(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export type MapTile = { x: number; y: number; left: number; top: number };

/**
 * The (2r+1)² tiles around a point, positioned in pixels inside a grid, plus the
 * point's own position in that grid. Tiles off the top or bottom of the world are
 * skipped; x wraps around the antimeridian.
 */
export function mapGrid(lat: number, lng: number, zoom: number, radius = 1) {
  const n = 2 ** zoom;
  const { x, y } = tileCoords(lat, lng, zoom);
  const originX = Math.floor(x) - radius;
  const originY = Math.floor(y) - radius;
  const tiles: MapTile[] = [];
  for (let row = 0; row <= radius * 2; row++) {
    for (let col = 0; col <= radius * 2; col++) {
      const ty = originY + row;
      if (ty < 0 || ty >= n) continue;
      tiles.push({
        x: (((originX + col) % n) + n) % n,
        y: ty,
        left: col * TILE_SIZE,
        top: row * TILE_SIZE,
      });
    }
  }
  return {
    tiles,
    size: (radius * 2 + 1) * TILE_SIZE,
    pointX: (x - originX) * TILE_SIZE,
    pointY: (y - originY) * TILE_SIZE,
  };
}

export function openStreetMapUrl(lat: number, lng: number, zoom = 17) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}
