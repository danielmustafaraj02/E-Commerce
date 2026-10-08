import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { privatePaths } from "./private-paths.mjs";
import { prepareLocalRoutes } from "./local-routes.mjs";

const files = execFileSync("git", ["ls-files", "-z", "--", ...privatePaths], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
try {
  prepareLocalRoutes(process.cwd(), "public");
  for (const path of files) {
    if (!existsSync(join(process.cwd(), ".local-only", path)))
      throw new Error(`Private source is not backed up: ${path}. Run npm run local:isolate first.`);
  }
  execFileSync("git", ["rm", "-r", "--cached", "-f", "--ignore-unmatch", "--", ...privatePaths], {
    stdio: "inherit",
  });
} finally {
  prepareLocalRoutes(process.cwd(), "dev");
}
console.log(
  "Private source removed from the Git index; ignored local files restored on disk. Commit the staged removals with the public build changes."
);
