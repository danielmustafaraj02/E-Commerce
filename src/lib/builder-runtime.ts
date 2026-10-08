/**
 * The little bit of JavaScript the builder's counter and countdown blocks need
 * (their HTML already shows the final number / target date, so nothing depends
 * on this running). Idempotent: each element is initialised once.
 */

const fmt = new Intl.NumberFormat("en-US");

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function animateCount(el: HTMLElement, target: number) {
  if (reducedMotion() || target <= 0) return;
  const start = performance.now();
  const duration = 1600;
  el.textContent = "0";
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt.format(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function runCountdown(el: HTMLElement) {
  const until = new Date(el.dataset.bldCountdown ?? "").getTime();
  if (!Number.isFinite(until)) return;
  const render = () => {
    const left = until - Date.now();
    if (left <= 0) {
      el.textContent = el.dataset.done || "00:00:00:00";
      return false;
    }
    const d = Math.floor(left / 86_400_000);
    const h = Math.floor((left % 86_400_000) / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    const s = Math.floor((left % 60_000) / 1000);
    const two = (n: number) => String(n).padStart(2, "0");
    el.textContent = `${d}d ${two(h)}h ${two(m)}m ${two(s)}s`;
    return true;
  };
  if (!render()) return;
  const timer = window.setInterval(() => {
    if (!document.contains(el) || !render()) window.clearInterval(timer);
  }, 1000);
}

const TYPE_DELAY: Record<string, number> = { slow: 95, normal: 55, fast: 28 };
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type TypePlan = { el: HTMLElement; nodes: Text[]; full: string[]; delay: number };

async function typeOut(plan: TypePlan, alive: () => boolean) {
  const caret = document.createElement("span");
  caret.className = "bld-caret";
  caret.setAttribute("aria-hidden", "true");
  plan.el.appendChild(caret);
  for (let i = 0; i < plan.nodes.length; i++) {
    for (let c = 1; c <= plan.full[i].length; c++) {
      if (!alive()) return;
      plan.nodes[i].data = plan.full[i].slice(0, c);
      await sleep(plan.delay);
    }
  }
  caret.remove();
  await sleep(350);
}

/**
 * Typing animation: headings and text with a typing speed are typed out one
 * after another (in page order) when their block scrolls into view, with a
 * caret; buttons marked "after typing" fade in once all of them are done. The
 * full text is in the HTML, so nothing depends on this running; visitors who
 * prefer reduced motion simply see the text.
 */
function initTyping(root: ParentNode) {
  if (reducedMotion() || typeof IntersectionObserver === "undefined") return;
  const groups = new Set<HTMLElement>();
  root.querySelectorAll<HTMLElement>("[data-bld-type]:not([data-bld-init])").forEach((el) => {
    const group = el.closest<HTMLElement>(".bld");
    if (group) groups.add(group);
  });
  groups.forEach((group) => {
    const plans: TypePlan[] = [];
    group.querySelectorAll<HTMLElement>("[data-bld-type]").forEach((el) => {
      if (el.dataset.bldInit) return;
      el.dataset.bldInit = "1";
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
      const full = nodes.map((n) => n.data);
      // Keep the room the finished text needs so nothing jumps while it types.
      el.style.minHeight = `${el.offsetHeight}px`;
      if (el.tagName.startsWith("H")) el.setAttribute("aria-label", el.textContent ?? "");
      nodes.forEach((n) => (n.data = ""));
      plans.push({ el, nodes, full, delay: TYPE_DELAY[el.dataset.bldType ?? "normal"] ?? 55 });
    });
    const afters = [...group.querySelectorAll<HTMLElement>("[data-bld-after]")];
    afters.forEach((a) => a.classList.add("bld-wait-typing"));
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        for (const plan of plans) await typeOut(plan, () => document.contains(group));
        afters.forEach((a) => a.classList.remove("bld-wait-typing"));
      },
      { threshold: 0.3 }
    );
    observer.observe(group);
  });
}

/**
 * Scroll animations. Blocks carrying data-bm start hidden (CSS) and are shown
 * by flipping a class: once, or again every time you scroll back to them
 * ("toggle": they leave when you scroll back up past them). Blocks that enter
 * together play in sequence: by their order number, then reading order, each
 * one a step (the design's stagger) after the previous. "scrub" blocks have
 * their progress set straight from their place on screen.
 */
const orderOf = (el: HTMLElement) => Number(el.dataset.bmOrder ?? 100);

function initMotion(root: ParentNode) {
  const all = [...root.querySelectorAll<HTMLElement>("[data-bm]:not([data-bm-init])")];
  if (all.length === 0) return;
  all.forEach((el) => (el.dataset.bmInit = "1"));
  if (reducedMotion() || typeof IntersectionObserver === "undefined") {
    all.forEach((el) => el.classList.add("bld-in"));
    return;
  }
  const scrub = all.filter((el) => el.dataset.bmMode === "scrub");
  const timed = all.filter((el) => el.dataset.bmMode !== "scrub");

  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort(
          (a, b) =>
            orderOf(a) - orderOf(b) ||
            (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        );
      entering.forEach((el, i) => {
        const step = Number(el.closest<HTMLElement>(".bld")?.dataset.bmStagger ?? 150);
        el.style.setProperty("--bm-del", `${Number(el.dataset.bmDelay ?? 0) + i * step}ms`);
        el.classList.add("bld-in");
        if (el.dataset.bmMode !== "toggle") io.unobserve(el);
      });
      for (const e of entries) {
        const el = e.target as HTMLElement;
        // Leaves only when you scroll back up past it, not when it scrolls off the top.
        if (!e.isIntersecting && el.dataset.bmMode === "toggle" && e.boundingClientRect.top > 0) {
          el.style.setProperty("--bm-del", "0ms");
          el.classList.remove("bld-in");
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  timed.forEach((el) => io.observe(el));

  if (scrub.length) {
    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight;
      for (const el of scrub) {
        const top = el.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (vh * 0.95 - top) / (vh * 0.5)));
        el.style.setProperty("--bm-p", String(Math.round(p * 1000) / 1000));
      }
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    update();
  }
}

/** Parallax: each block's content drifts against or with the scroll. */
function initParallax(root: ParentNode) {
  if (reducedMotion()) return;
  const els = [...root.querySelectorAll<HTMLElement>("[data-bld-par]:not([data-bm-par])")];
  if (els.length === 0) return;
  els.forEach((el) => (el.dataset.bmPar = "1"));
  let queued = false;
  const update = () => {
    queued = false;
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const offset = r.top + r.height / 2 - vh / 2;
      const px = (offset * Number(el.dataset.bldPar)) / 100;
      el.style.setProperty("--bld-par", `${Math.round(px)}px`);
    }
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  update();
}

export function initBuilderRuntime(root: ParentNode = document) {
  initParallax(root);
  initMotion(root);
  initTyping(root);
  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const el = entry.target as HTMLElement;
              observer?.unobserve(el);
              animateCount(el, Number(el.dataset.bldCount));
            }
          },
          { threshold: 0.4 }
        );

  root.querySelectorAll<HTMLElement>("[data-bld-count]:not([data-bld-init])").forEach((el) => {
    el.dataset.bldInit = "1";
    if (observer) observer.observe(el);
  });
  // Lines that draw themselves in: hidden (scaled to 0) until they are seen.
  if (!reducedMotion() && typeof IntersectionObserver !== "undefined") {
    const draw = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          draw.unobserve(el);
          el.classList.remove("bld-wait");
        }
      },
      { threshold: 0.3 }
    );
    root.querySelectorAll<HTMLElement>("[data-bld-draw]:not([data-bld-init])").forEach((el) => {
      el.dataset.bldInit = "1";
      el.classList.add("bld-wait");
      draw.observe(el);
    });
  }
  root.querySelectorAll<HTMLElement>("[data-bld-countdown]:not([data-bld-init])").forEach((el) => {
    el.dataset.bldInit = "1";
    runCountdown(el);
  });
}
