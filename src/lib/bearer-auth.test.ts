import { describe, expect, it } from "vitest";
import { isValidBearerToken } from "@/lib/bearer-auth";

function requestWithAuth(header: string | undefined) {
  const headers = new Headers();
  if (header !== undefined) headers.set("authorization", header);
  return new Request("https://example.com/api/whatever", { headers });
}

describe("isValidBearerToken", () => {
  it("accepts the exact expected bearer header", () => {
    expect(isValidBearerToken(requestWithAuth("Bearer s3cret"), "s3cret")).toBe(true);
  });

  it("rejects a wrong token", () => {
    expect(isValidBearerToken(requestWithAuth("Bearer wrong"), "s3cret")).toBe(false);
  });

  it("rejects a token that only differs in length", () => {
    expect(isValidBearerToken(requestWithAuth("Bearer s3cret-extra"), "s3cret")).toBe(false);
  });

  it("rejects a missing Authorization header", () => {
    expect(isValidBearerToken(requestWithAuth(undefined), "s3cret")).toBe(false);
  });

  it("rejects when no secret is configured, even with a matching-looking header", () => {
    expect(isValidBearerToken(requestWithAuth("Bearer undefined"), undefined)).toBe(false);
  });

  it("is case sensitive on the scheme", () => {
    expect(isValidBearerToken(requestWithAuth("bearer s3cret"), "s3cret")).toBe(false);
  });
});
