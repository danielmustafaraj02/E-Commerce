import { describe, expect, it } from "vitest";
import { AnnouncementBar } from "./announcement-bar";

describe("AnnouncementBar", () => {
  it("renders the given message as the bar's text", () => {
    const message =
      "Complimentary shipping across Italy & Europe · USA & Canada €30 · Rest of World €40";
    const bar = AnnouncementBar({ message });
    const paragraph = bar.props.children;
    expect(paragraph.props.children).toBe(message);
  });
});
