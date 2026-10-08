import { existsSync, readFileSync, readdirSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { privatePaths, privateRoute } from "./private-paths.mjs";

const root = process.cwd();
for (const path of privatePaths) {
  try {
    lstatSync(join(root, path));
    throw new Error(`Private source remains in production workspace: ${path}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
const manifest = join(root, ".next/server/app-paths-manifest.json");
if (!existsSync(manifest))
  throw new Error("No production route manifest. Run npm run build first.");
for (const route of Object.keys(JSON.parse(readFileSync(manifest, "utf8")))) {
  if (privateRoute.test(route)) throw new Error(`Private production route: ${route}`);
}
function inspectTraces(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) inspectTraces(path);
    else if (entry.name.endsWith(".nft.json")) {
      for (const file of JSON.parse(readFileSync(path, "utf8")).files ?? []) {
        const absolute = resolve(dir, file);
        if (
          absolute.includes(`${root}/.local-only/`) ||
          privatePaths.some(
            (p) => absolute === join(root, p) || absolute.startsWith(join(root, p) + "/")
          )
        )
          throw new Error(`Private source in deployment trace: ${file}`);
      }
    }
  }
}
inspectTraces(join(root, ".next"));
console.log("Public build verified: no private routes or traced private source files.");
