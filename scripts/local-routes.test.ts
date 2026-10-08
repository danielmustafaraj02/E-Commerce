import { afterEach, describe, expect, it } from "vitest";
import { prepareLocalRoutes } from "./local-routes.mjs";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "local-routes-"));
  roots.push(root);
  return { root, run: (mode: string) => prepareLocalRoutes(root, mode) };
}
describe("private source lifecycle", () => {
  it("preserves source through isolation, public build preparation and repeated local restores", () => {
    const { root, run } = fixture();
    mkdirSync(join(root, "src/app/admin"), { recursive: true });
    writeFileSync(join(root, "src/app/admin/page.tsx"), "private unsaved source");
    run("isolate");
    expect(existsSync(join(root, "src/app/admin"))).toBe(false);
    run("public");
    expect(existsSync(join(root, "src/app/admin"))).toBe(false);
    expect(readFileSync(join(root, ".local-only/src/app/admin/page.tsx"), "utf8")).toBe(
      "private unsaved source"
    );
    run("public");
    run("dev");
    run("dev");
    expect(readFileSync(join(root, "src/app/admin/page.tsx"), "utf8")).toBe(
      "private unsaved source"
    );
    expect(lstatSync(join(root, "src/app/admin")).isSymbolicLink()).toBe(false);
    writeFileSync(join(root, "src/app/admin/page.tsx"), "edited locally");
    run("public");
    run("dev");
    expect(readFileSync(join(root, "src/app/admin/page.tsx"), "utf8")).toBe("edited locally");
  });
  it("does not create private routes in a public clone", () => {
    const { root, run } = fixture();
    run("dev");
    run("public");
    expect(existsSync(join(root, "src/app/admin"))).toBe(false);
  });
  it("migrates old route links to real files that the dev watcher can discover", () => {
    const { root, run } = fixture();
    mkdirSync(join(root, ".local-only/src/app/admin"), { recursive: true });
    mkdirSync(join(root, "src/app"), { recursive: true });
    writeFileSync(join(root, ".local-only/src/app/admin/page.tsx"), "original admin");
    symlinkSync("../../.local-only/src/app/admin", join(root, "src/app/admin"));
    run("dev");
    expect(lstatSync(join(root, "src/app/admin")).isDirectory()).toBe(true);
    expect(lstatSync(join(root, "src/app/admin")).isSymbolicLink()).toBe(false);
    expect(readFileSync(join(root, "src/app/admin/page.tsx"), "utf8")).toBe("original admin");
    run("public");
    expect(existsSync(join(root, "src/app/admin"))).toBe(false);
    expect(readFileSync(join(root, ".local-only/src/app/admin/page.tsx"), "utf8")).toBe(
      "original admin"
    );
  });
  it("refuses to delete real source or overwrite an existing local backup", () => {
    const { root, run } = fixture();
    for (const path of ["src/app/admin", ".local-only/src/app/admin"]) {
      mkdirSync(join(root, path), { recursive: true });
      writeFileSync(join(root, path, "page.tsx"), path);
    }
    expect(() => run("public")).toThrow(/Local backup already exists|unmanaged symlink/);
    expect(() => run("isolate")).toThrow("Local backup already exists");
    expect(readFileSync(join(root, "src/app/admin/page.tsx"), "utf8")).toBe("src/app/admin");
  });
  it("refuses to unlink a symlink it does not own", () => {
    const { root, run } = fixture();
    mkdirSync(join(root, "src/app"), { recursive: true });
    symlinkSync(tmpdir(), join(root, "src/app/admin"));
    expect(() => run("public")).toThrow(/Local backup already exists|unmanaged symlink/);
    expect(lstatSync(join(root, "src/app/admin")).isSymbolicLink()).toBe(true);
  });
});
