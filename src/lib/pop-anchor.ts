/**
 * Where a product hover card opens, the same way everywhere on the site (hero
 * pieces, the collections showcase, Complete the look): just below and to the
 * right of the point where the pointer entered the piece (or the tap), flipped
 * left or up when there is no room, and kept inside its container. Computed
 * once when the card opens: the card then stays put while the pointer moves
 * over the same piece, so it can be reached without chasing it.
 *
 * All values are pixels relative to the container's top-left corner.
 */
export function popPosition({
  pointer,
  card,
  container,
  gap = 16,
  margin = 8,
}: {
  pointer: { x: number; y: number };
  card: { width: number; height: number };
  container: { width: number; height: number };
  /** Space between the pointer and the card's nearest corner. */
  gap?: number;
  /** Space kept from the container's edges. */
  margin?: number;
}): { left: number; top: number; origin: string } {
  let left = pointer.x + gap;
  if (left + card.width + margin > container.width) left = pointer.x - gap - card.width;
  let top = pointer.y + gap;
  if (top + card.height + margin > container.height) top = pointer.y - gap - card.height;
  const clamp = (value: number, size: number, room: number) =>
    Math.max(margin, Math.min(value, room - size - margin));
  const x = Math.round(clamp(left, card.width, container.width));
  const y = Math.round(clamp(top, card.height, container.height));
  // The corner nearest the pointer, for the card to grow from.
  const origin = `${y + card.height / 2 < pointer.y ? "bottom" : "top"} ${x + card.width / 2 < pointer.x ? "right" : "left"}`;
  return { left: x, top: y, origin };
}

/** popPosition for a pointer or touch event over `container`, sizing `card`. */
export function popPositionFor(
  event: { clientX: number; clientY: number },
  container: Element,
  card: HTMLElement
) {
  const box = container.getBoundingClientRect();
  return popPosition({
    pointer: { x: event.clientX - box.left, y: event.clientY - box.top },
    card: { width: card.offsetWidth, height: card.offsetHeight },
    container: { width: box.width, height: box.height },
  });
}
