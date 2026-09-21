import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  upsert: vi.fn(),
  writeAuditLog: vi.fn(),
}));

vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));
vi.mock("@/lib/store-settings", () => ({ getStoreSettings: async () => ({ id: "settings1" }) }));
vi.mock("@/lib/db", () => ({ db: { storeSettings: { upsert: mocks.upsert } } }));

import { updateOfflinePaymentSettings } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAdmin.mockResolvedValue({ user: { id: "admin1" } });
  mocks.upsert.mockResolvedValue({ id: "settings1", bankTransferEnabled: true });
});

describe("updateOfflinePaymentSettings", () => {
  it("refuses an IBAN with a mistyped digit and saves nothing", async () => {
    const result = await updateOfflinePaymentSettings(
      null,
      form({
        bankTransferEnabled: "on",
        bankAccountHolder: "Perla",
        bankIban: "IT60X0542811101000000123457",
      })
    );

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/IBAN/);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("refuses a malformed BIC", async () => {
    const result = await updateOfflinePaymentSettings(
      null,
      form({ bankAccountHolder: "Perla", bankIban: "IT60X0542811101000000123456", bankBic: "NOPE" })
    );

    expect(result.error).toMatch(/BIC/);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("does not let bank transfer be switched on without an account holder and IBAN", async () => {
    const result = await updateOfflinePaymentSettings(null, form({ bankTransferEnabled: "on" }));

    expect(result.success).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("stores the IBAN without spaces and the BIC in capitals", async () => {
    const result = await updateOfflinePaymentSettings(
      null,
      form({
        bankTransferEnabled: "on",
        bankAccountHolder: "Perla Murano Glass",
        bankIban: "it60 x054 2811 1010 0000 0123 456",
        bankBic: "bcit itmm",
      })
    );

    expect(result).toEqual({ error: null, success: true });
    const { update } = mocks.upsert.mock.calls[0][0];
    expect(update.bankIban).toBe("IT60X0542811101000000123456");
    expect(update.bankBic).toBe("BCITITMM");
    expect(update.bankTransferEnabled).toBe(true);
  });

  it("allows saving with bank transfer off and nothing filled in", async () => {
    const result = await updateOfflinePaymentSettings(null, form({}));

    expect(result.success).toBe(true);
    expect(mocks.upsert.mock.calls[0][0].update.bankIban).toBeNull();
  });
});
