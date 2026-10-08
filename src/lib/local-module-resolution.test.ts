import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import * as fs from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { JsConfigPathsPlugin } from "next/dist/build/webpack/plugins/jsconfig-paths-plugin";

const require = createRequire(import.meta.url);
const { create } = require("enhanced-resolve");
function resolver(configPath: string) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  return create.sync({
    fileSystem: fs,
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new JsConfigPathsPlugin(config.compilerOptions.paths, {
        baseUrl: resolve(configPath, ".."),
        isImplicit: true,
      }),
    ],
  });
}
describe("framework module resolution", () => {
  it("uses inert session modules with the public TypeScript configuration", () => {
    const resolveModule = resolver(resolve("tsconfig.json"));
    expect(resolveModule(process.cwd(), "@/lib/admin-session")).toBe(
      resolve("src/lib/admin-session.ts")
    );
    expect(resolveModule(process.cwd(), "@/lib/auth-runtime")).toBe(
      resolve("src/lib/auth-runtime.ts")
    );
  });
  it.skipIf(!existsSync(".local-only/tsconfig.json"))(
    "uses the actual private modules with Next's development path resolver",
    () => {
      const resolveModule = resolver(resolve(".local-only/tsconfig.json"));
      expect(resolveModule(process.cwd(), "@/lib/admin-session")).toBe(
        resolve(".local-only/src/admin-session.ts")
      );
      expect(resolveModule(process.cwd(), "@/lib/auth-runtime")).toBe(
        resolve(".local-only/src/auth.ts")
      );
    }
  );
});
