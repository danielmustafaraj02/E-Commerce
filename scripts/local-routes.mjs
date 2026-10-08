import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  renameSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { privatePaths } from "./private-paths.mjs";

export function prepareLocalRoutes(root, mode) {
  if (!["isolate", "dev", "public"].includes(mode)) throw new Error("Use isolate, dev or public.");
  const paths = privatePaths.map((path) => {
    const source = join(root, path);
    const local = join(root, ".local-only", path);
    let present;
    try {
      present = lstatSync(source);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (present?.isSymbolicLink()) {
      if (resolve(dirname(source), readlinkSync(source)) !== local)
        throw new Error(`Refusing to change an unmanaged symlink: ${path}`);
      if (mode === "dev" && !existsSync(local))
        throw new Error(`Local source is missing for ${path}; refusing to remove the link.`);
    } else if (present && existsSync(local)) {
      throw new Error(`Local backup already exists for ${path}; no files were overwritten.`);
    }
    return { source, local, present };
  });
  if (mode !== "dev") {
    rmSync(join(root, ".next/dev"), { recursive: true, force: true });
    rmSync(join(root, ".next/types"), { recursive: true, force: true });
  }
  for (const { source, local, present } of paths) {
    // Migrate the old links. Next's dev watcher needs real route directories.
    if (present?.isSymbolicLink()) unlinkSync(source);
    if (mode === "dev") {
      if ((!present || present.isSymbolicLink()) && existsSync(local)) {
        mkdirSync(dirname(source), { recursive: true });
        renameSync(local, source);
      }
    } else if (present && !present.isSymbolicLink()) {
      mkdirSync(dirname(local), { recursive: true });
      renameSync(source, local);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  prepareLocalRoutes(resolve(dirname(fileURLToPath(import.meta.url)), ".."), mode);
  console.log(
    mode === "dev"
      ? "Private local files restored for Next.js development."
      : "Private routes excluded; local source preserved in .local-only/."
  );
}
