import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  findOrder: vi.fn(),
  logoUrl: null as string | null,
  captureError: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("@/lib/db", () => ({ db: { order: { findUnique: mocks.findOrder } } }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: async () => ({ success: true }) }));
vi.mock("@/lib/monitoring", () => ({ captureError: mocks.captureError }));
vi.mock("@/lib/store-settings", () => ({
  getStoreSettings: async () => ({
    resendApiKey: "re_test",
    emailFrom: "orders@example.com",
    contactEmail: "help@example.com",
    storeName: "Perla Murano Glass",
    logoUrl: mocks.logoUrl,
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
  mocks.logoUrl = null;
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

  it("points the logo and product pictures at complete web addresses so inboxes can load them", async () => {
    mocks.logoUrl = "/logo.png";
    mocks.findOrder.mockResolvedValue({
      ...stored("en"),
      items: [
        {
          productName: "Bracelet",
          quantity: 1,
          unitPrice: 4500,
          product: { images: [{ url: "/products/bracelets/onyx.png" }] },
        },
      ],
    });

    await sendOrderStatusEmail(order);

    const html: string = mocks.send.mock.calls[0][0].html;
    expect(html).toContain('src="https://example.com/logo.png"');
    expect(html).toContain(
      'src="https://example.com/_next/image?url=%2Fproducts%2Fbracelets%2Fonyx.png&amp;w=128&amp;q=75"'
    );
    expect(html).not.toMatch(/src="\//);
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

describe("sendEmail error reporting", () => {
  it("reports it when Resend rejects the send instead of failing silently", async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "The example.com domain is not verified." },
    });

    await sendPasswordChangedEmail("user@example.com");

    expect(mocks.captureError).toHaveBeenCalledTimes(1);
    const [error, context] = mocks.captureError.mock.calls[0];
    expect((error as Error).message).toContain("The example.com domain is not verified.");
    expect(context).toMatchObject({ to: "user@example.com" });
  });

  it("does not report anything on a normal successful send", async () => {
    mocks.send.mockResolvedValue({ data: { id: "abc123" }, error: null });

    await sendPasswordChangedEmail("user@example.com");

    expect(mocks.captureError).not.toHaveBeenCalled();
  });
});
