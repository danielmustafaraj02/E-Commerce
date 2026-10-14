import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findPage: vi.fn(),
  upsertPage: vi.fn(),
  deletePage: vi.fn(),
  findStore: vi.fn(),
  updateStore: vi.fn(),
  createStore: vi.fn(),
  audit: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/db", () => ({
  db: {
    pageLayout: { findUnique: mocks.findPage, upsert: mocks.upsertPage, deleteMany: mocks.deletePage },
    storeSettings: {
      findFirst: mocks.findStore,
      update: mocks.updateStore,
      create: mocks.createStore,
    },
  },
}));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.audit }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { discardSectionDraft, saveSectionDraft, saveSectionEntry } from "./actions";
import { BOLD_TEMPLATE_IDS } from "@/lib/look-templates";
import { resolveLayout, SECTIONS_BY_TARGET } from "@/lib/page-layout";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({
    user: { id: "admin-user", role: "admin", mfaEnabled: true },
  });
  mocks.findPage.mockResolvedValue({
    layout: [{ id: "list", visible: false, options: { lookStyle: "collector" } }],
  });
  mocks.findStore.mockResolvedValue({
    id: "store",
    homeLayout: [{ id: "looks", visible: true, options: { lookStyle: "xxl" } }],
  });
  mocks.upsertPage.mockResolvedValue({});
  mocks.deletePage.mockResolvedValue({ count: 1 });
  mocks.updateStore.mockResolvedValue({});
  mocks.audit.mockResolvedValue(undefined);
});

// Look styles are chosen on the Looks page only; the home page follows it.
describe("saving bold look styles on the Looks page", () => {
  const target = "looks" as const;
  it.each(BOLD_TEMPLATE_IDS)(
    "persists and reloads %s through the actual section save action",
    async (style) => {
      const id = "list";
      const result = await saveSectionEntry(
        target,
        id,
        JSON.stringify({ id, visible: true, options: { lookStyle: style } })
      );
      expect(result).toEqual({ ok: "Published." });
      // Publishing makes the work in progress the live version.
      expect(mocks.deletePage).toHaveBeenCalledWith({ where: { target: "sec-draft:looks:list" } });
      expect(mocks.requireAdmin).toHaveBeenCalledOnce();
      const written = mocks.upsertPage.mock.calls.find(([args]) => args.where.target === "looks")?.[0]
        .update.layout;
      const reloaded = resolveLayout(
        JSON.parse(JSON.stringify(written)),
        SECTIONS_BY_TARGET[target]
      );
      expect(reloaded.find((entry) => entry.id === id)?.options?.lookStyle).toBe(style);
      // Saving a section cannot change visibility set on the page's list.
      expect(reloaded.find((entry) => entry.id === id)?.visible).toBe(false);
      expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
      expect(mocks.audit).toHaveBeenCalled();
    }
  );
});

describe("look style save authorization", () => {
  it("does not read or write the layout when admin authorization fails", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("MFA required"));
    await expect(
      saveSectionEntry(
        "looks",
        "list",
        JSON.stringify({ options: { lookStyle: BOLD_TEMPLATE_IDS[0] } })
      )
    ).rejects.toThrow("MFA required");
    expect(mocks.findPage).not.toHaveBeenCalled();
    expect(mocks.upsertPage).not.toHaveBeenCalled();
    expect(mocks.updateStore).not.toHaveBeenCalled();
  });
});

describe("section drafts", () => {
  it("keeps the work in progress under its own key, off the live layout", async () => {
    const result = await saveSectionDraft(
      "looks",
      "list",
      JSON.stringify({ id: "list", visible: true, options: { lookStyle: BOLD_TEMPLATE_IDS[0] } })
    );

    expect(result.error).toBeUndefined();
    expect(Date.parse(result.at!)).not.toBeNaN();
    expect(mocks.upsertPage).toHaveBeenCalledOnce();
    const [{ where, update }] = mocks.upsertPage.mock.calls[0];
    expect(where).toEqual({ target: "sec-draft:looks:list" });
    expect(update.layout.entry.options.lookStyle).toBe(BOLD_TEMPLATE_IDS[0]);
    // A draft never touches the page itself, nor the audit log.
    expect(mocks.updateStore).not.toHaveBeenCalled();
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it.each([
    ["an unknown page", "nowhere", "list"],
    ["a malformed section id", "looks", "list:../x"],
  ])("refuses %s without writing anything", async (_, target, id) => {
    const result = await saveSectionDraft(target as "looks", id, JSON.stringify({ id }));

    expect(result.error).toBeTruthy();
    expect(mocks.upsertPage).not.toHaveBeenCalled();
  });

  it("refuses a draft that is not JSON", async () => {
    expect((await saveSectionDraft("looks", "list", "{nope")).error).toBeTruthy();
    expect(mocks.upsertPage).not.toHaveBeenCalled();
  });

  it("throws a draft away without touching the live version", async () => {
    expect(await discardSectionDraft("looks", "list")).toEqual({ ok: "Draft thrown away." });
    expect(mocks.deletePage).toHaveBeenCalledWith({ where: { target: "sec-draft:looks:list" } });
    expect(mocks.upsertPage).not.toHaveBeenCalled();
  });

  it("checks admin access before saving a draft", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("MFA required"));
    await expect(saveSectionDraft("looks", "list", "{}")).rejects.toThrow("MFA required");
    expect(mocks.upsertPage).not.toHaveBeenCalled();
  });
});
