import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashVerificationToken } from "@/lib/register-user";
import { getStoreSettings } from "@/lib/store-settings";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const settings = await getStoreSettings();
  const base = settings.siteUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Unauthenticated and unlisted in the nav, but still a public endpoint that
  // hashes its input and does two DB round-trips per hit — worth capping so
  // it can't be used to hammer the DB, even though the tokens themselves
  // (two UUIDs, or 32 random bytes) are too high-entropy to brute-force.
  const { success } = await rateLimit(`verify-email:${clientIp(request)}`, 20, 60_000);
  if (!success) {
    return NextResponse.redirect(`${base}/account?verified=0`);
  }

  if (!token) {
    return NextResponse.redirect(`${base}/account?verified=0`);
  }

  const hashed = hashVerificationToken(token);
  const record = await db.verificationToken.findUnique({ where: { token: hashed } });
  if (!record || record.expires < new Date()) {
    if (record) await db.verificationToken.delete({ where: { token: hashed } }).catch(() => {});
    return NextResponse.redirect(`${base}/account?verified=expired`);
  }

  await db.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  await db.verificationToken.delete({ where: { token: hashed } });

  return NextResponse.redirect(`${base}/account?verified=1`);
}
