import { db } from "../src/lib/db";

const s = await db.storeSettings.findFirst({ select: { id: true, homeLayout: true } });
const arr = Array.isArray(s?.homeLayout) ? s.homeLayout : null;
console.log("storeSettings id:", s?.id);
console.log("homeLayout is array:", Array.isArray(arr), "len:", arr?.length ?? 0);
if (arr) {
  for (const e of arr) {
    if (String(e.id).startsWith("custom-")) {
      console.log(" -", e.id, "visible:", e.visible, "custom:", !!e.custom);
    }
  }
}
await db.$disconnect();