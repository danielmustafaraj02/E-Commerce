import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "react-email";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, localeDir } from "@/lib/i18n/locale-constants";
import { VerifyEmail } from "./verify-email";
import { ResetPasswordEmail } from "./reset-password";
import { OrderStatusEmail, type OrderStatus } from "./order-status";

const STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const shared = {
  storeName: "Perla Murano Glass",
  logoUrl: null,
  primaryColor: "#0f6e5e",
};

// The plain-text renderer upper-cases headings, so compare ignoring case.
const has = (text: string, expected: string) =>
  expect(text.toLowerCase()).toContain(expected.toLowerCase());

// Anything still shaped like {placeholder} after rendering was never filled in.
const UNFILLED = /\{[a-zA-Z]+\}/;

describe.each(locales)("emails in %s", (locale) => {
  const t = getDictionary(locale).emails;

  it("renders the verification email in that language", async () => {
    const element = React.createElement(VerifyEmail, {
      ...shared,
      t,
      locale,
      verifyUrl: "https://example.com/verify?token=abc",
      expiresInHours: 24,
    });
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);

    has(text, t.verifyHeading);
    has(text, t.verifyButton);
    expect(text).not.toMatch(UNFILLED);
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`dir="${localeDir(locale)}"`);
  });

  it("renders the password reset email in that language", async () => {
    const element = React.createElement(ResetPasswordEmail, {
      ...shared,
      t,
      locale,
      resetUrl: "https://example.com/reset?token=abc",
      expiresInMinutes: 60,
    });
    const text = await render(element, { plainText: true });

    has(text, t.resetHeading);
    has(text, t.resetButton);
    expect(text).not.toMatch(UNFILLED);
  });

  it.each(STATUSES)("renders the %s order email in that language", async (status) => {
    const element = React.createElement(OrderStatusEmail, {
      ...shared,
      t,
      lang: locale,
      locale,
      orderNumber: "ORD-1",
      orderDate: "21 September 2026",
      status,
      trackingNumber: status === "shipped" ? "IT123" : null,
      orderUrl: "https://example.com/order-confirmation/ORD-1",
      items: [{ name: "Bracelet", quantity: 1, unitPrice: 4500, imageUrl: null }],
      currency: "EUR",
      total: 4500,
      companyLegalName: "Perla Murano Glass S.r.l.",
      companyAddress: "Murano, Venezia",
      vatNumber: "IT123",
    });
    const text = await render(element, { plainText: true });

    has(text, t.status[status].heading);
    has(text, t.status[status].message);
    has(text, t.orderNumberLabel);
    expect(text).not.toMatch(UNFILLED);
  });
});
