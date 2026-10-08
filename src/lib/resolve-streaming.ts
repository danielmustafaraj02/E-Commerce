/**
 * Next streams a page: slow parts arrive after a loading placeholder, as a
 * hidden `<div id="S:n">` plus an inline script call that moves it into place
 * (`$RC("B:a","S:b")` replaces a placeholder with its content, `$RS("S:a","P:b")`
 * drops a finished piece into its slot). A copy of the page made without
 * running scripts (the admin's previews) would keep the placeholders and miss
 * the real content, so those calls are replayed here, in document order, on
 * the parsed DOM, doing what React's own helper does.
 */
export function resolveStreaming(doc: Document) {
  const calls: { kind: string; a: string; b: string }[] = [];
  doc.querySelectorAll("script").forEach((script) => {
    for (const m of (script.textContent ?? "").matchAll(/\$R([CS])\("([^"]+)","([^"]+)"\)/g)) {
      calls.push({ kind: m[1], a: m[2], b: m[3] });
    }
  });

  for (const { kind, a, b } of calls) {
    if (kind === "S") {
      // Segment: S:a's children go in front of the placeholder P:b.
      const source = doc.getElementById(a);
      const slot = doc.getElementById(b);
      if (!source || !slot?.parentNode) continue;
      while (source.firstChild) slot.parentNode.insertBefore(source.firstChild, slot);
      slot.remove();
      source.remove();
      continue;
    }
    // Boundary: B:a ... <!--/$--> is the placeholder, S:b the real content.
    const marker = doc.getElementById(a);
    const content = doc.getElementById(b);
    const parent = marker?.parentNode;
    if (!marker || !content || !parent) continue;
    const doomed: ChildNode[] = [marker];
    let end: ChildNode | null = null;
    let depth = 0;
    for (let node = marker.nextSibling; node; node = node.nextSibling) {
      if (node.nodeType === 8) {
        const data = (node as Comment).data;
        if (data === "/$") {
          if (depth === 0) {
            end = node;
            break;
          }
          depth--;
        } else if (data.startsWith("$")) depth++;
      }
      doomed.push(node);
    }
    if (!end) continue;
    while (content.firstChild) parent.insertBefore(content.firstChild, end);
    doomed.forEach((node) => node.remove());
    content.remove();
  }
}
