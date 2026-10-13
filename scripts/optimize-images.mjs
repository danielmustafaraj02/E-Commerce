// Stores the site's bundled photos as WebP.
//
//   node scripts/optimize-images.mjs            convert every photo without an up-to-date .webp
//                                               (runs before `npm run dev` and `npm run build`)
//   node scripts/optimize-images.mjs --archive  also move the converted originals, and camera
//                                               RAW files, to originals/public/ (git-ignored),
//                                               so only the WebP files are committed and deployed
//
// Photos are scaled down to at most 2560px on their long side, turned upright,
// stripped of metadata (camera EXIF and GPS position never reach the site) and
// encoded at quality 86, where differences from the original are invisible;
// Next's optimizer re-encodes them per screen size anyway.
//
// Pages keep working while an original is still waiting to be converted or
// archived: the app asks for the .webp (src/lib/public-image.ts) and a request
// for a missing original is rewritten to its WebP (next.config.ts).
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, watch } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Keep in step with PHOTO_DIRS in src/lib/public-image.ts (public-image.test.ts checks).
export const PHOTO_DIRS = ["products", "hero", "about", "blog", "gift-card", "decor"];

const PHOTO = /\.(jpe?g|png)$/i;
const RAW = /\.(cr2|cr3|nef|arw|dng|raf|orf|rw2|heic|tiff?|psd)$/i;
const MAX_EDGE = 2560;

function filesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const webpPath = (file) => join(dirname(file), `${basename(file, extname(file))}.webp`);

async function toWebp(sharp, file, out) {
  const meta = await sharp(file).metadata();
  // Many product PNGs carry an alpha channel that is opaque everywhere; dropping
  // it saves the bytes of encoding it.
  const transparent = meta.hasAlpha && !(await sharp(file).stats()).isOpaque;
  let image = sharp(file)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  if (meta.hasAlpha && !transparent) image = image.removeAlpha();
  await image.webp({ quality: 86, alphaQuality: 90, effort: 6, smartSubsample: true }).toFile(out);
}

function archive(root, file) {
  let target = join(root, "originals", relative(root, file));
  // Never overwrite an earlier archived copy.
  for (let n = 2; existsSync(target); n++) {
    target = join(dirname(target), `${basename(file, extname(file))}.${n}${extname(file)}`);
  }
  mkdirSync(dirname(target), { recursive: true });
  renameSync(file, target);
}

export async function optimizeImages(
  root,
  { archive: archiveOriginals = false, log = console.log, changedFiles = [] } = {}
) {
  const files = PHOTO_DIRS.flatMap((dir) => filesIn(join(root, "public", dir)));
  // A photo replaced after its conversion (same name, newer file) is converted again.
  const pending = files.filter(
    (file) =>
      PHOTO.test(file) &&
      (changedFiles.includes(file) ||
        !existsSync(webpPath(file)) ||
        statSync(file).mtimeMs > statSync(webpPath(file)).mtimeMs)
  );
  const result = { converted: 0, archived: 0, bytesBefore: 0, bytesAfter: 0 };

  if (pending.length) {
    // Next installs sharp for its own image optimizer; it is only loaded when
    // there is something to convert.
    const { default: sharp } = await import("sharp").catch((error) => {
      throw new Error(
        `${pending.length} photo(s) need converting to WebP but sharp could not be loaded (${error.message}). Run npm install, then npm run images:webp.`
      );
    });
    for (const file of pending) {
      const out = webpPath(file);
      await toWebp(sharp, file, out);
      result.converted++;
      result.bytesBefore += statSync(file).size;
      result.bytesAfter += statSync(out).size;
      log(`webp  ${relative(root, out)}`);
    }
  }

  if (archiveOriginals) {
    for (const file of files) {
      if (!existsSync(file)) continue;
      if ((PHOTO.test(file) && existsSync(webpPath(file))) || RAW.test(file)) {
        archive(root, file);
        result.archived++;
      }
    }
  }
  return result;
}

// Watch original photos only: writing a WebP must never trigger another conversion.
export function watchImages(
  root,
  { debounceMs = 300, log = console.log, onError = console.error, onConverted = () => {} } = {}
) {
  const publicDir = join(root, "public");
  mkdirSync(publicDir, { recursive: true });
  const changed = new Set();
  let timer;
  let running;
  let closed = false;
  let retries = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(convert, debounceMs);
  };
  const convert = () => {
    if (closed || running) return;
    const changedFiles = [...changed];
    changed.clear();
    running = optimizeImages(root, { log, changedFiles })
      .then((result) => {
        retries = 0;
        if (result.converted) onConverted(result);
      })
      .catch((error) => {
        onError(error);
        // A file may still be copying when its first filesystem event arrives.
        if (++retries < 3) changedFiles.forEach((file) => changed.add(file));
      })
      .finally(() => {
        running = undefined;
        if (!closed && changed.size) schedule();
      });
  };
  const watcher = watch(publicDir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    const name = filename.toString();
    if (!PHOTO_DIRS.includes(name.split(/[\\/]/)[0]) || !PHOTO.test(name)) return;
    changed.add(join(publicDir, name));
    retries = 0;
    schedule();
  });
  watcher.on("error", onError);
  schedule();
  return {
    async close() {
      closed = true;
      clearTimeout(timer);
      watcher.close();
      await running;
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { converted, archived, bytesBefore, bytesAfter } = await optimizeImages(root, {
    archive: process.argv.includes("--archive"),
  });
  const mb = (bytes) => (bytes / 1048576).toFixed(1);
  if (converted)
    console.log(`Converted ${converted} photos: ${mb(bytesBefore)} MB -> ${mb(bytesAfter)} MB.`);
  if (archived) console.log(`Moved ${archived} originals to originals/public/.`);
}
