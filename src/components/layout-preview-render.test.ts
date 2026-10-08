import { createElement as h } from "react";
import { describe, expect, it, vi } from "vitest";

// The live renderer pulls in server-only modules (database, auth) that cannot
// load in a unit test; preview mode never renders it.
vi.mock("./builder-view", () => ({ BuilderView: () => null }));
import { renderToString } from "react-dom/server";
import { LayoutPreviewBridge } from "./layout-preview-bridge";
import { LayoutSection } from "./layout-section";
import { HOME_SECTIONS, resolveLayout } from "@/lib/page-layout";
import { SECTION_TEMPLATES } from "@/lib/section-builder";

describe("preview mode rendering", () => {
  it("renders the bridge and every kind of section on the server", () => {
    const layout = resolveLayout(
      [
        {
          id: "custom-abc123",
          visible: true,
          custom: { name: "x", html: "", css: "" },
          builder: SECTION_TEMPLATES[0].doc,
        },
        { id: "faq", visible: false, html: "<p>x</p>" },
      ],
      HOME_SECTIONS
    );
    const html = renderToString(
      h(
        "main",
        null,
        ...layout.map((e) =>
          h(LayoutSection, { key: e.id, entry: e, preview: true }, h("p", null, "child"))
        ),
        h(LayoutPreviewBridge, { target: "home" })
      )
    );
    expect(html).toContain('data-layout-id="custom-abc123"');
  });
});
