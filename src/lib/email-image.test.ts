import { describe, expect, it } from "vitest";
import { emailAbsoluteUrl, emailThumbnailUrl } from "./email-image";

const base = "https://shop.example";

describe("emailAbsoluteUrl", () => {
  it("adds the site address to a local path and leaves full addresses alone", () => {
    expect(emailAbsoluteUrl("/logo.png", base)).toBe("https://shop.example/logo.png");
    expect(emailAbsoluteUrl("https://cdn.example/l.png", base)).toBe("https://cdn.example/l.png");
  });

  it("returns null when there is no image", () => {
    expect(emailAbsoluteUrl(null, base)).toBeNull();
    expect(emailAbsoluteUrl("", base)).toBeNull();
  });
});

describe("emailThumbnailUrl", () => {
  it("serves a local product picture as a small resized copy with a complete address", () => {
    expect(emailThumbnailUrl("/products/bracelets/a b.png", `${base}/`)).toBe(
      "https://shop.example/_next/image?url=%2Fproducts%2Fbracelets%2Fa%20b.png&w=128&q=75"
    );
  });

  it("uses a picture hosted elsewhere as it is", () => {
    expect(emailThumbnailUrl("https://cdn.example/p.jpg", base)).toBe("https://cdn.example/p.jpg");
    expect(emailThumbnailUrl("//cdn.example/p.jpg", base)).toBe("//cdn.example/p.jpg");
  });

  it("returns null when there is no picture", () => {
    expect(emailThumbnailUrl(undefined, base)).toBeNull();
  });
});
