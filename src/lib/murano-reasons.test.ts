import { describe, expect, it } from "vitest";
import { MURANO_REASON_COUNT, chosenBySlot, pickReasonProducts } from "./murano-reasons";

const p = (id: string) => ({ id });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe("chosenBySlot", () => {
  it("puts each product in the slot its id was stored in, whatever order the products came in", () => {
    const slots = chosenBySlot([p("a"), p("b"), p("c")], ["c", "", "a"]);
    expect(slots).toEqual([p("c"), undefined, p("a")]);
  });

  it("leaves a slot empty when its piece is gone (unpublished, hidden, deleted)", () => {
    expect(chosenBySlot([p("a")], ["x", "a", "y"])).toEqual([undefined, p("a"), undefined]);
  });

  it("is all empty when nothing is stored", () => {
    expect(chosenBySlot([p("a")], [])).toEqual([undefined, undefined, undefined]);
  });
});

describe("pickReasonProducts", () => {
  const fallback = [p("f1"), p("f2"), p("f3"), p("f4")];

  it("keeps a choice in its own row and fills the others automatically", () => {
    const picked = pickReasonProducts([undefined, p("s2"), undefined], fallback);
    expect(ids(picked)).toEqual(["f1", "s2", "f2"]);
  });

  it("is purely automatic when nothing is chosen", () => {
    expect(ids(pickReasonProducts([undefined, undefined, undefined], fallback))).toEqual([
      "f1",
      "f2",
      "f3",
    ]);
  });

  it("never offers a chosen piece again as another row's automatic one", () => {
    // f1 is chosen for row 3; rows 1 and 2 must not also be f1.
    const picked = pickReasonProducts([undefined, undefined, p("f1")], fallback);
    expect(ids(picked)).toEqual(["f2", "f3", "f1"]);
  });

  it("uses all three choices as given", () => {
    expect(ids(pickReasonProducts([p("a"), p("b"), p("c")], fallback))).toEqual(["a", "b", "c"]);
  });

  it("returns fewer rows than the count when there are not enough pieces", () => {
    expect(pickReasonProducts([undefined, undefined, undefined], [p("only")])).toHaveLength(1);
  });

  it("is capped at the number of reasons", () => {
    const many = Array.from({ length: 8 }, (_, i) => p(String(i)));
    expect(pickReasonProducts([], many)).toHaveLength(MURANO_REASON_COUNT);
  });
});
