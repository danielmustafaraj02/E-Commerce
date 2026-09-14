import { NextResponse } from "next/server";
import { processAbandonedOrders } from "@/lib/abandoned-orders";
import { captureError } from "@/lib/monitoring";

// Triggered hourly by vercel.json's cron entry, which Vercel calls with
// `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is set
// as an env var — see README §Abandoned cart recovery. Any other trigger
// (external cron, GitHub Actions) must send that same header.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAbandonedOrders();
    return NextResponse.json(result);
  } catch (error) {
    captureError(error, { scope: "abandoned-orders-cron" });
    return NextResponse.json({ error: "Failed to process abandoned orders" }, { status: 500 });
  }
}
