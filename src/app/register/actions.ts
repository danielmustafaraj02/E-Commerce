"use server";

import { headers } from "next/headers";
import { registerSchema, registerUser, RegistrationError } from "@/lib/register-user";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { signIn } from "@/auth";

export async function register(_prevState: unknown, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!success) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const captchaOk = await verifyTurnstile(
    formData.get("cf-turnstile-response") as string | null,
    ip
  );
  if (!captchaOk) {
    return { error: "Verification failed. Please try again." };
  }

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof RegistrationError) {
      return { error: error.message };
    }
    throw error;
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/account?welcome=1",
  });
  return { error: null };
}
