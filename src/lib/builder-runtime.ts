/**
 * The little bit of JavaScript the builder's blocks need: scroll motion,
 * counters, drawn lines, typing and countdowns (their HTML already shows the
 * final state, so nothing depends on this running). Everything that animates
 * follows the scroll. Idempotent: each element is initialised once.
 */

const fmt = new Intl.NumberFormat("en-US");

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * How far an element has come up the screen, 0 to 1: 0 as its top reaches the
 * bottom edge, 1 once it has travelled half a screen. `lead` (a share of the
 * screen) starts it later. The end is capped at where the page can actually
 * scroll to, so a block just above the footer still finishes.
 */
function scrollProgress(el: HTMLElement, lead = 0) {
  const vh = window.innerHeight;
  const top = el.getBoundingClientRect().top;
  const maxScroll = document.documentElement.scrollHeight - vh;
  const topAtEnd = top - (maxScroll - window.scrollY);
  const from = vh * (0.95 - lead);
  const to = Math.min(from - 1, Math.max(vh * (0.45 - lead), topAtEnd));
  return Math.min(1, Math.max(0, (from - top) / (from - to)));
}

/** Runs `update` once now and then on every scroll or resize frame. */
function onScrollFrame(update: () => void) {
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  update();
}

/** Counters count up with the scroll: the number follows the block's place
 *  on screen, so scrolling back up counts it down again. */
function initCounters(root: ParentNode) {
  const els = [...root.querySelectorAll<HTMLElement>("[data-bld-count]:not([data-bld-init])")];
  els.forEach((el) => (el.dataset.bldInit = "1"));
  const counted = els.filter((el) => Number(el.dataset.bldCount) > 0);
  if (counted.length === 0 || reducedMotion()) return;
  onScrollFrame(() => {
    for (const el of counted) {
      const eased = 1 - Math.pow(1 - scrollProgress(el), 3);
      el.textContent = fmt.format(Math.round(Number(el.dataset.bldCount) * eased));
    }
  });
}

/** Lines that draw themselves in, at the pace of the scroll: dividers grow
 *  across, column rules grow down. */
function initDrawnLines(root: ParentNode) {
  const els = [...root.querySelectorAll<HTMLElement>("[data-bld-draw]:not([data-bld-init])")];
  els.forEach((el) => (el.dataset.bldInit = "1"));
  if (els.length === 0 || reducedMotion()) return;
  for (const el of els) {
    if (el.classList.contains("bld")) el.classList.add("bld-drawing");
    else el.style.transition = "none";
  }
  onScrollFrame(() => {
    for (const el of els) {
      const p = scrollProgress(el).toFixed(3);
      if (el.classList.contains("bld")) el.style.setProperty("--bld-draw", p);
      else el.style.transform = el.classList.contains("bld-vline") ? `scaleY(${p})` : `scaleX(${p})`;
    }
  });
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
 * Scroll animations. Every block carrying data-bm follows the scroll: its
 * progress (--bm-p, 0 hidden to 1 shown) is set straight from its place on
 * screen, so it moves in as it comes up and plays backwards when you scroll
 * back past it. The design's per-block delay still counts, as a later start
 * (one second is a fifth of the screen). Older designs saved "once" or
 * "replay"; they scrub too now, so the whole site moves the same way.
 */
function initMotion(root: ParentNode) {
  const all = [...root.querySelectorAll<HTMLElement>("[data-bm]:not([data-bm-init])")];
  if (all.length === 0) return;
  all.forEach((el) => (el.dataset.bmInit = "1"));
  if (reducedMotion()) {
    all.forEach((el) => el.classList.add("bld-in"));
    return;
  }
  all.forEach((el) => el.classList.add("bld-scrub"));
  onScrollFrame(() => {
    for (const el of all) {
      const lead = Math.min(0.4, Number(el.dataset.bmDelay ?? 0) / 5000);
      el.style.setProperty("--bm-p", String(Math.round(scrollProgress(el, lead) * 1000) / 1000));
    }
  });
}

/** Parallax: each block's content drifts against or with the scroll. */
function initParallax(root: ParentNode) {
  if (reducedMotion()) return;
  const els = [...root.querySelectorAll<HTMLElement>("[data-bld-par]:not([data-bm-par])")];
  if (els.length === 0) return;
  els.forEach((el) => (el.dataset.bmPar = "1"));
  onScrollFrame(() => {
    const vh = window.innerHeight;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const offset = r.top + r.height / 2 - vh / 2;
      const px = (offset * Number(el.dataset.bldPar)) / 100;
      el.style.setProperty("--bld-par", `${Math.round(px)}px`);
    }
  });
}

export function initBuilderRuntime(root: ParentNode = document) {
  initParallax(root);
  initMotion(root);
  initTyping(root);
  initCounters(root);
  initDrawnLines(root);
  root.querySelectorAll<HTMLElement>("[data-bld-countdown]:not([data-bld-init])").forEach((el) => {
    el.dataset.bldInit = "1";
    runCountdown(el);
  });
}
