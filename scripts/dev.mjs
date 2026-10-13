import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareLocalRoutes } from "./local-routes.mjs";
import { optimizeImages, watchImages } from "./optimize-images.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
prepareLocalRoutes(root, "dev");
await optimizeImages(root);
const images = watchImages(root);
const require = createRequire(import.meta.url);
const next = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", ...process.argv.slice(2)],
  { cwd: root, stdio: "inherit" }
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void images.close();
    next.kill(signal);
  });
}
next.once("error", async (error) => {
  console.error(error.message);
  await images.close();
  process.exitCode = 1;
});
next.once("exit", async (code, signal) => {
  await images.close();
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
});
