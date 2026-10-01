"use client";

/**
 * The vertical progress indicator for the collection showcase.
 *
 * Three dots joined by one continuous track, on a fixed vertical rhythm so that
 * changing a dot's state never moves any dot: every row is the same height (44px,
 * which is also the minimum touch target) and the connecting track is inset by
 * exactly half a row at each end, so it runs from the first dot's centre to the
 * last. Nothing about the state — outlined, filled, enlarged, ringed — affects
 * layout, because every state is expressed with background, border and scale on
 * a fixed-size element.
 *
 * The component renders its own reserved column inside the stage grid (see
 * collection-showcase.css). It is NOT an overlay: the stage lays out three
 * columns — an empty balancing gutter, the scene content, and this rail — and the
 * rail's width is a grid track, so the labels, the dots, the active ring and the
 * focus outline all live in space the layout has already set aside. Each row is
 * [label | dot], with the dot pinned to the column's outer edge and the label
 * filling the rest and WRAPPING — never positioned out of the column, so it can
 * never reach the scene text.
 *
 * Progress and state are deliberately separate:
 *  - the TRACK fills continuously with the showcase's own scroll progress, so it
 *    still reads as motion mid-transition, when no category is current;
 *  - each DOT states which category is being read, which only changes at the
 *    reading positions.
 *
 * This file holds no scroll handling: the showcase's existing update() pass
 * writes `--rail-fill` on the root and `data-state` / `aria-current` on each
 * item, so there is no second listener or animation loop anywhere.
 */
export type ShowcaseRailItem = {
  id: string;
  /** The localised category name, used for the visible and accessible labels. */
  name: string;
};

export function ShowcaseProgressRail({
  items,
  onSelect,
  label,
}: {
  items: ShowcaseRailItem[];
  /** Called with the scene index to navigate to. */
  onSelect: (index: number) => void;
  /** Accessible name for the navigation landmark. */
  label: string;
}) {
  return (
    <nav className="showcase-rail" aria-label={label} data-showcase-rail>
      {/* The continuous track: a muted hairline with the brand-green progress
          line scaled over it from the top. It is positioned across the whole rail
          column and inset by half a row, so it spans dot-centre to dot-centre. */}
      <span className="showcase-rail-track" aria-hidden="true">
        <span className="showcase-rail-fill" />
      </span>

      {items.map((item, index) => (
        <div className="showcase-rail-row" key={item.id}>
          {/* The localised category name. It is an IN-FLOW element inside the
              rail's own reserved column and wraps there — no absolute
              positioning, no negative offset, no tooltip. The current category's
              label is always visible; the others appear on hover or keyboard
              focus. All three occupy the same space, so revealing one never
              reflows the track or the dots. */}
          <span className="showcase-rail-label">{item.name}</span>
          <button
            type="button"
            className="showcase-rail-item"
            data-rail-item={index}
            data-state={index === 0 ? "active" : "upcoming"}
            /* The active dot is marked as the current item in the set, for
                assistive tech. The accessible name is the category name, so the
                control is fully labelled even where its visible label is hidden. */
            aria-current={index === 0 ? "true" : undefined}
            aria-label={item.name}
            onClick={() => onSelect(index)}
          />
        </div>
      ))}
    </nav>
  );
}