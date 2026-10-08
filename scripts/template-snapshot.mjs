/** Runs in the source browser document. Keep it self-contained for evaluate(). */
export function templateSnapshot(selector = "main") {
  const source = document.querySelector(selector);
  if (!source) throw new Error(`Template content not found: ${selector}`);
  const snapshot = document.documentElement.cloneNode(true);
  const body = snapshot.querySelector("body");
  const main = selector === "main" ? source.cloneNode(true) : document.createElement("main");
  if (selector !== "main") {
    main.className = source.closest(".shelf")?.className ?? "";
    main.append(source.cloneNode(true));
  }
  const template = main.firstElementChild;
  if (!template) throw new Error("The template has no rendered content.");
  template.setAttribute("data-template-capture", "true");
  body.replaceChildren(main);
  body.classList.remove("bld-playing");
  body.style.margin = "0";
  body.style.minHeight = "0";
  body.style.display = "block";
  snapshot
    .querySelectorAll(
      "script, base, .bld-rz, .bld-grid, .bld-ctx, .bld-gap, .bld-guide, .bld-cz, .bld-ghost"
    )
    .forEach((node) => node.remove());
  snapshot.querySelectorAll("style").forEach((node) => {
    if (node.textContent.includes(".bld-rz-r")) node.remove();
  });
  snapshot.querySelectorAll(".bld-sel, .bld-multi, .bld-dragging").forEach((node) => {
    node.classList.remove("bld-sel", "bld-multi", "bld-dragging");
  });
  snapshot
    .querySelectorAll("[contenteditable]")
    .forEach((node) => node.removeAttribute("contenteditable"));
  snapshot
    .querySelectorAll("[data-reveal]")
    .forEach((node) => node.setAttribute("data-reveal", "true"));
  snapshot.querySelectorAll(".bld-an").forEach((node) => node.style.setProperty("--bm-p", "1"));
  snapshot.querySelectorAll("img").forEach((node) => node.setAttribute("loading", "eager"));
  return "<!doctype html>" + snapshot.outerHTML;
}
