import {
  HOME_SECTIONS,
  resolveLayout,
  withEditorialExamples,
  isEditorialSeed,
} from "../src/lib/page-layout";
import { templateBody } from "../src/lib/page-templates";

const make = (id: string) => templateBody(id);

// 1. Fresh install: nothing stored.
const fresh = resolveLayout(null, HOME_SECTIONS);
const withSeeds = withEditorialExamples(fresh, make);
console.log("fresh has custom-manifesto:", withSeeds.some((e) => e.id === "custom-manifesto"));

// 2. Simulate what deleteCustomSection writes for an editorial seed.
const stored = withSeeds.flatMap((e) => {
  if (e.id !== "custom-manifesto" || !e.custom) return [e];
  if (!isEditorialSeed(e.id)) return [];
  return [{ id: e.id, visible: false, custom: { name: e.custom.name, html: "", css: "" } }];
});
console.log("after delete, stored entry:", JSON.stringify(stored.find((e) => e.id === "custom-manifesto")));

// 3. Does the seed come back? (the tombstone should suppress it)
const resolved = resolveLayout(stored, HOME_SECTIONS);
const rendered = withEditorialExamples(resolved, make);
const manifesto = rendered.filter((e) => e.id === "custom-manifesto");
console.log("manifesto entries after delete:", manifesto.length, manifesto.map((e) => e.visible));

// 4. The failing case: delete on a layout that never stored the seed.
const emptyDelete = resolveLayout(null, HOME_SECTIONS).flatMap((e) => {
  if (e.id !== "custom-manifesto" || !e.custom) return [e];
  return [];
});
const reRendered = withEditorialExamples(resolveLayout(emptyDelete, HOME_SECTIONS), make);
console.log(
  "delete-no-op case, manifesto present again:",
  reRendered.some((e) => e.id === "custom-manifesto")
);