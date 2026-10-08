import { describe, expect, it } from "vitest";
import { ARTICLES } from "@/lib/journal";
import { bodySchema, sourcesSchema, translationItSchema } from "@/lib/journal/article-schema";
import { articleToPostData } from "./import-builtin";

// Every built-in article must survive the trip into the admin editor, which
// silently drops anything the schemas reject.
describe("articleToPostData", () => {
  const images = new Map<string, string>();
  for (const article of ARTICLES) {
    it(`${article.slug} converts to valid editor data`, () => {
      const data = articleToPostData(
        article,
        new Proxy(images, {
          get: (t, k) => (k === "get" ? () => "/products/x.jpg" : Reflect.get(t, k)),
        }) as Map<string, string>
      );
      expect(bodySchema.safeParse(data.body).error?.issues ?? []).toEqual([]);
      expect(sourcesSchema.safeParse(data.sources).error?.issues ?? []).toEqual([]);
      if (data.translationIt) {
        expect(translationItSchema.safeParse(data.translationIt).error?.issues ?? []).toEqual([]);
      }
      expect(data.description.length).toBeLessThanOrEqual(300);
      expect(data.intro.length).toBeLessThanOrEqual(2000);
      expect(data.title.length).toBeLessThanOrEqual(150);
    });
  }
});
