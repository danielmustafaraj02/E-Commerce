import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  findOrder: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("@/lib/db", () => ({ db: { order: { findUnique: mocks.findOrder } } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => ({ success: true }) }));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({
    resendApiKey: "re_test",
    emailFrom: "orders@example.com",
    contactEmail: "help@example.com",
    storeName: "Perla Murano Glass",
    logoUrl: null,
    primaryColor: "#0f6e5e",
    siteUrl: "https://example.com",
    defaultLocale: "en-US",
    companyLegalName: null,
    companyAddress: null,
    vatNumber: null,
  }),
}));
// Outside a request there is no visitor language to read, as in a webhook or cron.
vi.mock("@/lib/i18n/locale", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/i18n/locale")>()),
  getLocale: async () => {
    throw new Error("no request");
  },
}));

import { sendOrderStatusEmail, sendPasswordChangedEmail } from "./email";

const order = {
  orderNumber: "ORD-1",
  status: "paid",
  trackingNumber: null,
  guestEmail: "buyer@example.com",
  user: null,
};

function stored(locale: string | null) {
  return {
    total: 4500,
    currency: "EUR",
    locale,
    createdAt: new Date("2026-09-21T10:00:00Z"),
    items: [{ productName: "Bracelet", quantity: 1, unitPrice: 4500, product: { images: [] } }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendOrderStatusEmail", () => {
  it("writes to the customer in the language the order was placed in", async () => {
    mocks.findOrder.mockResolvedValue(stored("it"));

    await sendOrderStatusEmail(order);

    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).toBe("Ordine ORD-1: Pagamento ricevuto");
    expect(sent.html).toContain('lang="it"');
    expect(sent.text).toContain("Numero ordine");
  });

  it("uses right-to-left for Arabic", async () => {
    mocks.findOrder.mockResolvedValue(stored("ar"));

    await sendOrderStatusEmail(order);

    expect(mocks.send.mock.calls[0][0].html).toContain('dir="rtl"');
  });

  it("falls back to English for an order placed before the language was stored", async () => {
    mocks.findOrder.mockResolvedValue(stored(null));

    await sendOrderStatusEmail(order);

    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).toBe("Order ORD-1: Payment received");
    expect(sent.html).toContain('lang="en"');
  });

  it("sends an unknown status as plain text in the customer's language", async () => {
    mocks.findOrder.mockResolvedValue(stored("de"));

    await sendOrderStatusEmail({ ...order, status: "on_hold" });

    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).toBe("Bestellung ORD-1: on_hold");
    expect(sent.html).toBeUndefined();
    expect(sent.text).toContain("Bestellnummer: ORD-1");
  });
});

describe("sendPasswordChangedEmail", () => {
  it("is written in the requested language and names the contact address", async () => {
    await sendPasswordChangedEmail("user@example.com", "fr");

    const sent = mocks.send.mock.calls[0][0];
    expect(sent.subject).toBe("Votre mot de passe a été modifié — Perla Murano Glass");
    expect(sent.text).toContain("à l'adresse help@example.com");
  });

  it("is English when there is no language to go on", async () => {
    await sendPasswordChangedEmail("user@example.com");

    expect(mocks.send.mock.calls[0][0].subject).toBe(
      "Your password was changed — Perla Murano Glass"
    );
  });
});
