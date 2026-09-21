import { NextResponse } from "next/server";
import { registerSchema, registerUser, RegistrationError } from "@/lib/register-user";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getFeedback } from "@/lib/i18n/feedback";

export async function POST(request: Request) {
  const t = await getFeedback();
  const { success } = await rateLimit(`register:${clientIp(request)}`, 5, 60_000);
  if (!success) {
    return NextResponse.json({ error: t.tooManyRequests }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: t.invalidInput, issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    if (error instanceof RegistrationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
