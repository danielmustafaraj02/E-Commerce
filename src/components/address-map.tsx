import { TILE_SIZE, mapGrid, openStreetMapUrl } from "@/lib/map-tiles";
import type { GeocodeResult } from "@/lib/geocode";

// How far to zoom so the pin is useful: close for an exact building, wider when
// we only know the town or area.
const ZOOM: Record<GeocodeResult["precision"], number> = { building: 17, street: 16, area: 14 };

/**
 * A small map drawn straight from OpenStreetMap's public tiles: no map library, no
 * API key, no script. Shows a pin on the point and links to the full map. The
 * attribution is required by OpenStreetMap's licence, so it stays visible.
 */
export function AddressMap({
  lat,
  lng,
  precision = "building",
  alt,
  openLabel,
  className = "",
}: {
  lat: number;
  lng: number;
  precision?: GeocodeResult["precision"];
  alt: string;
  openLabel: string;
  className?: string;
}) {
  const zoom = ZOOM[precision];
  const grid = mapGrid(lat, lng, zoom);
  const link = openStreetMapUrl(lat, lng, zoom);

  return (
    <figure
      className={`border-foreground/10 bg-surface relative m-0 h-56 w-full max-w-[30rem] overflow-hidden rounded-lg border ${className}`}
    >
      {/* The whole grid is shifted so the searched point sits at the middle of the frame. */}
      <div
        role="img"
        aria-label={alt}
        className="absolute"
        style={{
          width: grid.size,
          height: grid.size,
          left: `calc(50% - ${grid.pointX}px)`,
          top: `calc(50% - ${grid.pointY}px)`,
        }}
      >
        {grid.tiles.map((tile) => (
          // Plain <img>: these are third-party map tiles, not catalog images to
          // optimise, and routing them through next/image would proxy every tile.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${tile.x}-${tile.y}`}
            src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute max-w-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      {/* Pin: its tip is the centre of the frame. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 32"
        width="30"
        height="40"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full drop-shadow-md"
      >
        <path
          d="M12 1C6.2 1 1.5 5.6 1.5 11.3 1.5 19 12 31 12 31s10.5-12 10.5-19.7C22.5 5.6 17.8 1 12 1Z"
          fill="#d6336c"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="11.3" r="4" fill="#ffffff" />
      </svg>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-background/90 text-foreground hover:text-accent absolute start-2 bottom-2 rounded px-2 py-1 text-xs font-medium shadow-sm"
      >
        {openLabel}
      </a>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-background/90 text-foreground/70 absolute end-0 bottom-0 px-1.5 py-0.5 text-[10px]"
      >
        © OpenStreetMap contributors
      </a>
    </figure>
  );
}
