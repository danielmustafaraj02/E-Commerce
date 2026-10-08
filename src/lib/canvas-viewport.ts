/** Fit a logical canvas into the workbench while keeping its device breakpoint. */
export function canvasViewport(available: number, logical: number, zoom: number) {
  const width = Number.isFinite(available) && available > 0 ? available : logical;
  const scale = Math.min(1, width / logical) * zoom;
  return { scale, width: logical * scale };
}
