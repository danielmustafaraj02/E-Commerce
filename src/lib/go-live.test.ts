import { describe, expect, it } from "vitest";
import {
  evaluateReadiness,
  stepStatus,
  stripeKeyMode,
  versionAtLeast,
  type ReadinessFacts,
} from "./go-live";

const ready = (): ReadinessFacts => ({
  store: {
    name: "Perla Murano Glass",
    placeholderName: false,
    contactEmail: "hello@perlamuranoglass.com",
    currency: "EUR",
    companyLegalName: true,
    companyAddress: true,
  },
  shipping: { zones: 3, zonesWithActiveMethod: 3 },
  taxRules: 4,
  legalSlugs: ["terms", "privacy", "returns", "cookies"],
  products: { listed: 54, withImages: 54, inStock: 50 },
  site: {
    url: "https://perlamuranoglass.com",
    status: { kind: "ok", httpStatus: 200 },
    https: true,
    hsts: true,
  },
  vercel: { linked: true, projectName: "e-commerce" },
  git: { available: true, branch: "main", uncommitted: 0, unpushed: 0, lastCommit: "abc “x”" },
  stripe: {
    secret: { present: true, mode: "test", source: "settings" },
    publishable: { present: true, mode: "test", source: "settings" },
    webhook: true,
    succeededPayments: 2,
  },
  paypal: { configured: false },
  env: {
    authSecretStrong: true,
    cronSecret: true,
    rateLimit: true,
    turnstile: true,
    email: true,
    databaseTls: true,
  },
  admins: { total: 1, withoutMfa: 0 },
  seo: { metaDescription: true, ogImage: true, siteVerification: true, unconvertedImages: 0 },
  nextVersion: "16.3.8",
});

const find = (facts: ReadinessFacts, id: string) =>
  evaluateReadiness(facts)
    .flatMap((step) => step.checks)
    .find((c) => c.id === id)!;

describe("evaluateReadiness", () => {
  it("has nothing blocking a store that is ready", () => {
    const steps = evaluateReadiness(ready());
    expect(steps.map((s) => s.id)).toEqual([
      "store",
      "domain",
      "stripe",
      "security",
      "seo",
      "publish",
    ]);
    expect(steps.flatMap((s) => s.checks).filter((c) => c.status === "block")).toEqual([]);
    expect(find(ready(), "blocking").status).toBe("pass");
  });

  it("blocks the launch while Vercel has disabled the deployment, and says why", () => {
    const facts = ready();
    facts.site.status = { kind: "disabled", httpStatus: 402 };
    const site = find(facts, "site");
    expect(site.status).toBe("block");
    expect(site.detail).toContain("402");
    expect(site.fix).toMatch(/Hobby/);
    expect(find(facts, "blocking").detail).toContain("Live site");
  });

  it("refuses a test key paired with a live key", () => {
    const facts = ready();
    facts.stripe.publishable.mode = "live";
    expect(find(facts, "stripe-match").status).toBe("block");
  });

  it("blocks without the webhook secret that confirms payments", () => {
    const facts = ready();
    facts.stripe.webhook = false;
    expect(find(facts, "stripe-webhook").status).toBe("block");
  });

  it("never reports live payments as something to switch on by itself", () => {
    expect(find(ready(), "stripe-live").status).toBe("info");
  });

  it("names missing policy pages", () => {
    const facts = ready();
    facts.legalSlugs = ["terms"];
    expect(find(facts, "legal").detail).toBe("Missing: privacy, returns, cookies.");
  });

  it("warns about code that isn't deployed yet", () => {
    const facts = ready();
    facts.git.uncommitted = 5;
    expect(find(facts, "code").status).toBe("warn");
    expect(find(facts, "code").fix).toContain("git push");
  });

  it("flags a framework version with published vulnerabilities", () => {
    const facts = ready();
    facts.nextVersion = "16.3.4";
    expect(find(facts, "next-version").status).toBe("block");
  });

  it("summarizes each step by its worst check", () => {
    const facts = ready();
    facts.seo.metaDescription = false;
    const steps = evaluateReadiness(facts);
    expect(stepStatus(steps.find((s) => s.id === "seo")!)).toBe("warn");
    expect(stepStatus(steps.find((s) => s.id === "store")!)).toBe("pass");
  });
});

describe("stripeKeyMode", () => {
  it.each([
    ["sk_test_abc", "test"],
    ["pk_live_abc", "live"],
    ["rk_live_abc", "live"],
    ["whsec_abc", null],
    [null, null],
  ])("%s is %s", (key, mode) => {
    expect(stripeKeyMode(key)).toBe(mode);
  });
});

describe("versionAtLeast", () => {
  it.each([
    ["16.3.8", "16.3.8", true],
    ["16.4.0", "16.3.8", true],
    ["16.3.4", "16.3.8", false],
    ["15.9.9", "16.3.8", false],
  ])("%s ≥ %s is %s", (a, b, expected) => {
    expect(versionAtLeast(a, b)).toBe(expected);
  });
});
