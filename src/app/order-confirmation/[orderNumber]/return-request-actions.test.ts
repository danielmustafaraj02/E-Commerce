import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  auth: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  writeAuditLog: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({
  db: { order: { findUnique: mocks.findUnique }, returnRequest: { create: mocks.create } },
}));
vi.mock("@/lib/audit-log", () => ({ writeAuditLog: mocks.writeAuditLog }));
vi.mock("@/lib/i18n/feedback", () => ({
  getFeedback: async () => ({
    returnReasonRequired: "reason-required",
    orderNotFound: "order-not-found",
    returnNotEligible: "not-eligible",
    returnInProgress: "in-progress",
  }),
}));

import { requestReturn } from "./return-request-actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rateLimit.mockResolvedValue({ success: true, remaining: 5 });
  mocks.auth.mockResolvedValue(null);
});

describe("requestReturn", () => {
  it("creates a return request for a guest order", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order-1",
      userId: null,
      status: "delivered",
      returnRequests: [],
    });
    mocks.create.mockResolvedValue({ id: "return-1" });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: null, success: true });
    expect(mocks.create).toHaveBeenCalledWith({
      data: { orderId: "order-1", userId: null, reason: "wrong size" },
    });
    expect(mocks.writeAuditLog).not.toHaveBeenCalled();
  });

  it("is rate limited per IP before touching the database", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: "order-not-found", success: false });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects an empty reason", async () => {
    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "" })
    );

    expect(result).toEqual({ error: "reason-required", success: false });
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("refuses an order it can't access", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order-1",
      userId: "someone-else",
      status: "delivered",
      returnRequests: [],
    });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: "order-not-found", success: false });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("refuses an order that isn't returnable yet", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order-1",
      userId: null,
      status: "pending",
      returnRequests: [],
    });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: "not-eligible", success: false });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("refuses a second request while one is already in progress", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "order-1",
      userId: null,
      status: "delivered",
      returnRequests: [{ status: "pending" }],
    });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: "in-progress", success: false });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("logs an audit entry when a signed-in owner files the request", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1", role: "customer" } });
    mocks.findUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      status: "delivered",
      returnRequests: [],
    });
    mocks.create.mockResolvedValue({ id: "return-1" });

    const result = await requestReturn(
      "ORD-1",
      { error: null, success: false },
      form({ reason: "wrong size" })
    );

    expect(result).toEqual({ error: null, success: true });
    expect(mocks.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", action: "return_request.create" })
    );
  });
});
