#!/usr/bin/env node
/** Capture the real authenticated template previews. Never apply or save a design. */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { delimiter, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createInterface } from "node:readline/promises";
import { templateSnapshot } from "./template-snapshot.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing value for ${name}`);
  return args[i + 1];
};
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const filename = (s) => s.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 180);
const sizes = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
];

if (flag("--help")) {
  console.log(
    `Capture every section's ten designs, native Looks styles and article openings.\n\nnpm run visual:review -- --login [--url http://localhost:3000]\n\n--login       Open the browser so you can sign in, then press Enter here.\n--url URL     Address of the running store (default http://localhost:3000).\n--section ID  Limit capture to e.g. home/hero or article/head.\n--headed      Keep the capture browser visible.\n\nOutput: reports/visual-review/<timestamp>/index.html, PNGs and manifest.json.\nThe browser profile stays in ignored reports/visual-review/profile.\nNo storefront changes are saved. Browser login and image/font loading use your actual app.`
  );
  process.exit(0);
}

async function playwright() {
  try {
    return await import("playwright");
  } catch {}
  // npm exec adds its temporary package's .bin directory to PATH.
  for (const bin of (process.env.PATH ?? "").split(delimiter)) {
    if (!bin.endsWith(".bin")) continue;
    const modulePath = join(dirname(bin), "playwright", "index.mjs");
    if (existsSync(modulePath)) return import(pathToFileURL(modulePath).href);
  }
  throw new Error(
    "Playwright not found. Run npm run visual:review instead of calling this script directly."
  );
}

async function settle(page) {
  await page.evaluate(async () => {
    await Promise.race([
      Promise.all([
        document.fonts.ready,
        ...[...document.images].map((image) => image.decode().catch(() => {})),
      ]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Fonts or images did not settle within 15 seconds")),
          15000
        )
      ),
    ]);
  });
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  );
}

async function collectFindings(page) {
  return page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
    brokenImages: [...document.images]
      .filter((i) => i.currentSrc && i.naturalWidth === 0)
      .map((i) => ({ alt: i.alt, source: new URL(i.currentSrc).pathname })),
  }));
}

function galleryHtml(records, status = "Capture in progress") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Perla · Template visual review</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f8f4;color:#154230;font:15px/1.6 system-ui,sans-serif}header{padding:32px;border-bottom:1px solid #dce2d9;background:white}h1{font:400 36px Georgia,serif;margin:0 0 12px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:24px;padding:24px}article{background:white;border:1px solid #dce2d9;border-radius:8px;padding:16px;min-width:0}h2{font-size:18px;margin:0}img{width:100%;height:360px;object-fit:contain;object-position:top;border:1px solid #eee;background:#fafafa}a{color:inherit}.note{color:#9a3412}select{padding:8px;margin-right:8px;background:white;border:1px solid #c8d3ca}</style></head><body><header><h1>Template visual review</h1><p class="note">${escape(status)}</p><p>${records.length} captures. Open an image at full size to review typography, contrast, buttons and image frames.</p><label>Device <select id="device"><option value="">All</option><option>desktop</option><option>mobile</option></select></label><label>Page <select id="target"><option value="">All</option>${[...new Set(records.map((r) => r.target))].map((t) => `<option>${escape(t)}</option>`).join("")}</select></label></header><main>${records.map((r) => `<article data-device="${escape(r.device)}" data-target="${escape(r.target)}"><h2>${escape(r.name)}</h2><p>${escape(r.target)} · ${escape(r.section)} · ${escape(r.device)}</p>${r.file ? `<a href="${escape(r.file)}"><img loading="lazy" src="${escape(r.file)}" alt="${escape(r.name)} ${escape(r.device)} screenshot"></a>` : ""}${r.error ? `<p class="note">Capture failed: ${escape(r.error)}</p>` : ""}${r.findings?.horizontalOverflow ? '<p class="note">Horizontal overflow detected.</p>' : ""}${r.findings?.brokenImages?.length ? `<p class="note">${r.findings.brokenImages.length} images did not load.</p>` : ""}</article>`).join("")}</main><script>const device=document.getElementById('device'),target=document.getElementById('target');function filter(){document.querySelectorAll('article').forEach(a=>a.hidden=(device.value&&a.dataset.device!==device.value)||(target.value&&a.dataset.target!==target.value))}device.onchange=target.onchange=filter;</script></body></html>`;
}

async function main() {
  const supplied = new URL(value("--url", "http://localhost:3000"));
  if (!["http:", "https:"].includes(supplied.protocol) || supplied.username || supplied.password)
    throw new Error("Use an HTTP(S) app URL without embedded credentials.");
  const base = supplied.origin;
  const root = resolve(value("--output-dir", "reports/visual-review"));
  const out = join(root, new Date().toISOString().replace(/[:.]/g, "-"));
  const profile = join(root, "profile");
  await mkdir(profile, { recursive: true, mode: 0o700 });
  await mkdir(out, { recursive: true });
  let context;
  const records = [];
  let phase = "Loading Playwright";
  let status = "running";
  const address = (path) => new URL(path, base).href;
  const persist = async () => {
    await writeFile(
      join(out, "manifest.json"),
      JSON.stringify({ app: base, scope: "templates-only", status, phase, records }, null, 2)
    );
    await writeFile(join(out, "index.html"), galleryHtml(records, phase));
  };
  const progress = async (next) => {
    phase = next;
    await persist();
    console.log(next);
  };
  await progress(phase);
  console.log(`Capture report: ${join(out, "index.html")}`);
  try {
    const { chromium } = await playwright();
    await progress("Launching capture browser");
    context = await chromium.launchPersistentContext(profile, {
      headless: !flag("--login") && !flag("--headed"),
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    await progress("Opening admin Page layout");
    const editor = context.pages()[0] ?? (await context.newPage());
    editor.setDefaultTimeout(20000);
    editor.setDefaultNavigationTimeout(60000);
    editor.on("dialog", (dialog) =>
      dialog.type() === "beforeunload" ||
      dialog.message() === "Replace this design with the template?"
        ? dialog.accept()
        : dialog.dismiss()
    );
    const opening = await editor.goto(address("/admin/settings/page-layout"), {
      waitUntil: "domcontentloaded",
    });
    if (opening?.status() === 404)
      throw new Error(
        "Local admin route returned 404. Restart npm run dev to restore the private routes; production builds exclude them."
      );
    if (opening && opening.status() >= 500)
      throw new Error(
        `The local app returned HTTP ${opening.status()}. Check the npm run dev terminal for its compilation or database error.`
      );
    if (flag("--login")) {
      await progress("Waiting for admin sign-in and Enter in the terminal");
      const terminal = createInterface({ input: process.stdin, output: process.stdout });
      await terminal.question(
        "Sign in as admin in the browser, then press Enter here to capture all templates: "
      );
      terminal.close();
      await editor.goto(address("/admin/settings/page-layout"), { waitUntil: "domcontentloaded" });
    }
    await progress("Checking admin access and current editor controls");
    if (new URL(editor.url()).pathname !== "/admin/settings/page-layout")
      throw new Error("Admin login is required. Re-run with --login and sign in normally.");
    try {
      await editor.locator("[data-visual-target]").first().waitFor();
    } catch {
      throw new Error(
        "The loaded Page layout screen does not contain the current capture controls. Restart the app using the latest project code, then rerun the capture."
      );
    }
    await progress("Discovering page sections");
    // Capture only reads after login. Block any accidental form/server-action writes.
    await context.route("**/*", (route) =>
      ["GET", "HEAD"].includes(route.request().method()) ? route.continue() : route.abort()
    );
    const sections = [];
    const targets = await editor
      .locator("[data-visual-target]")
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.visualTarget));
    for (const target of targets) {
      await editor.locator(`[data-visual-target="${target}"]`).click();
      await editor.locator(`[data-visual-section^="${target}/"]`).first().waitFor();
      sections.push(
        ...(await editor.locator("[data-visual-section]").evaluateAll((links) =>
          links.map((link) => ({
            id: link.dataset.visualSection,
            href: link.getAttribute("href"),
          }))
        ))
      );
    }
    const only = value("--section", "");
    const selected = only ? sections.filter((s) => s.id === only) : sections;
    if (!selected.length)
      throw new Error(`No section matches ${only || "the current page layout"}.`);
    const render = await context.newPage();
    render.setDefaultTimeout(20000);
    render.setDefaultNavigationTimeout(60000);
    // A standalone local document, with no storefront or admin layout.
    const canvas = await render.goto(address("/api/admin/template-capture"), {
      waitUntil: "domcontentloaded",
    });
    if (!canvas?.ok())
      throw new Error(
        "The local template capture page is unavailable. Restart npm run dev using the latest code."
      );
    const recordFailure = async (info, error) => {
      records.push({ ...info, error: error.message.split("\n")[0] });
      await persist();
      if (editor.isClosed() || render.isClosed())
        throw new Error(
          "The capture browser closed. Restart capture to review the remaining templates."
        );
    };
    const captureTemplate = async (html, info) => {
      for (const size of sizes) {
        const record = { ...info, device: size.name };
        try {
          await render.setViewportSize({ width: size.width, height: size.height });
          const replay = html.replace(
            /<head([^>]*)>/i,
            `<head$1><base href="${escape(base + "/")}">`
          );
          await render.setContent(replay, { waitUntil: "load", timeout: 30000 });
          await settle(render);
          record.findings = await collectFindings(render);
          record.file = filename(`${info.target}-${info.section}-${info.id}-${size.name}`) + ".png";
          await render.locator("[data-template-capture]").screenshot({
            path: join(out, record.file),
            animations: "disabled",
          });
          records.push(record);
          await persist();
          console.log(`Captured ${info.target}/${info.section} · ${info.name} · ${size.name}`);
        } catch (error) {
          await recordFailure(record, error);
        }
      }
    };
    const captureFrame = async (frameLocator, info) => {
      await frameLocator.waitFor({ state: "attached" });
      const revision = await frameLocator.getAttribute("data-visual-revision");
      const handle = await frameLocator.elementHandle();
      const frame = await handle.contentFrame();
      if (!frame) throw new Error("Preview frame did not load.");
      await frame.waitForLoadState("domcontentloaded");
      await frame.waitForFunction(
        (expected) =>
          document.body &&
          document.querySelector("main") &&
          document.documentElement.dataset.visualRevision === expected,
        revision
      );
      await captureTemplate(await frame.evaluate(templateSnapshot), info);
    };
    const capturedLegacy = new Set();
    for (const section of selected) {
      const [target, id] = section.id.split("/");
      await progress(`Capturing ${section.id}`);
      try {
        await editor.setViewportSize({ width: 1440, height: 1000 });
        await editor.goto(address(section.href), { waitUntil: "domcontentloaded" });
        if (new URL(editor.url()).pathname !== section.href)
          throw new Error("Admin session expired or section access failed.");
        const primary = editor.locator("[data-visual-primary] iframe[data-visual-preview]");
        await primary.waitFor({ timeout: 45000 });
        await editor.setViewportSize({ width: 1440, height: 1000 });
        await editor
          .locator("details")
          .filter({ has: editor.locator('[data-visual-gallery="section"]') })
          .locator(":scope > summary")
          .click();
        const gallery = editor.locator('[data-visual-gallery="section"]');
        const designs = await gallery.locator("[data-visual-select]").evaluateAll((buttons) =>
          buttons.map((button) => ({
            id: button.dataset.visualSelect,
            name: button.textContent.trim().replace(/^\d+\s*/, ""),
          }))
        );
        for (const design of designs) {
          const info = { target, section: id, ...design };
          try {
            await gallery.locator(`[data-visual-select="${design.id}"]`).click();
            const active = gallery.locator(
              `[data-visual-template="${design.id}"][data-visual-active="true"]`
            );
            await active.waitFor();
            await captureFrame(active.locator("iframe[data-visual-preview]"), info);
          } catch (error) {
            await recordFailure(info, error);
          }
        }
        // The native article openings include the blended title the user likes.
        if (target === "article" && id === "head") {
          await editor.getByRole("tab", { name: "Options", exact: true }).click();
          const picker = editor.getByLabel("Title and hero layout", { exact: true });
          const initialOpening = await picker.inputValue();
          const options = await picker
            .locator("option")
            .evaluateAll((nodes) => nodes.map((node) => ({ id: node.value, name: node.label })));
          for (const option of options) {
            await picker.selectOption(option.id);
            await captureFrame(primary, {
              target,
              section: id,
              id: `opening-${option.id}`,
              name: option.name,
            });
          }
          await picker.selectOption(initialOpening);
        }
        const designTab = editor.getByRole("tab", { name: "Design", exact: true });
        if (await designTab.count()) {
          await designTab.click();
          const legacy = await editor.locator("[data-visual-legacy]").evaluateAll((nodes) =>
            nodes.map((node) => ({
              id: node.dataset.visualLegacy,
              name: node.dataset.visualName,
            }))
          );
          for (const template of legacy) {
            if (capturedLegacy.has(template.id)) continue;
            capturedLegacy.add(template.id);
            const info = { target, section: id, id: `legacy-${template.id}`, name: template.name };
            try {
              await editor.locator(`[data-visual-legacy="${template.id}"]`).click();
              await captureFrame(primary, info);
            } catch (error) {
              await recordFailure(info, error);
            }
          }
        }
        await persist();
      } catch (error) {
        await recordFailure({ target, section: id, id: "section", name: "Section capture" }, error);
      }
    }
    if (!only) {
      try {
        await editor.goto(address("/admin/settings/page-layout/looks-preview"), {
          waitUntil: "domcontentloaded",
        });
        const picker = editor.getByLabel("Template", { exact: true });
        const options = await picker
          .locator("option")
          .evaluateAll((nodes) =>
            nodes
              .filter((node) => node.value !== "all")
              .map((node) => ({ id: node.value, name: node.label }))
          );
        for (const option of options) {
          const info = { target: "looks", section: "native", ...option };
          try {
            await editor.setViewportSize({ width: 1440, height: 1000 });
            await editor.getByLabel("Canvas width", { exact: true }).selectOption("1440");
            await picker.selectOption(option.id);
            const selector = `[aria-labelledby="tpl-${option.id}"] .look-preview-canvas .looks-editorial-list`;
            const panel = editor.locator(selector);
            await panel.waitFor();
            await captureTemplate(await editor.evaluate(templateSnapshot, selector), info);
          } catch (error) {
            await recordFailure(info, error);
          }
        }
      } catch (error) {
        await recordFailure(
          { target: "looks", section: "native", name: "Native Looks capture" },
          error
        );
      }
    }
    const failures = records.filter((r) => r.error).length;
    status = failures ? "partial" : "captured";
    await progress(
      failures
        ? `Capture finished with ${failures} failures`
        : "Capture finished; screenshots are ready for visual review"
    );
    console.log(
      `\nReview gallery: ${join(out, "index.html")}\n${records.filter((r) => r.file).length} screenshots; ${failures} failed captures. No storefront changes saved.`
    );
    if (failures) process.exitCode = 1;
  } catch (error) {
    status = "failed";
    const message = error.message.split("\n")[0];
    records.push({ target: "runner", section: "startup", name: phase, error: message });
    phase = `Stopped during ${phase}: ${message}`;
    await persist();
    console.error(`Failure details saved to: ${join(out, "manifest.json")}`);
    throw error;
  } finally {
    await context?.close();
  }
}

main().catch((error) => {
  console.error(`Visual capture could not finish: ${error.message.split("\n")[0]}`);
  if (/Executable doesn't exist|browser.*not installed/i.test(error.message))
    console.error(
      "Install Chromium: npm exec --yes --package=playwright -- playwright install chromium"
    );
  else if (/page.goto|local app|Local admin route/.test(error.message))
    console.error(
      "Start npm run dev in another terminal, wait for Ready, and open /admin/settings/page-layout in your browser. If Next uses another port, rerun capture with --url http://localhost:PORT."
    );
  process.exitCode = 1;
});
