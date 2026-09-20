"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { newPasswordSchema, resetPassword } from "@/lib/password-reset";

export type ResetPasswordState = { error: "invalid" | "weak" | "generic" | null };

export async function submitNewPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await rateLimit(`reset:${ip}`, 10, 60_000);
  if (!success) return { error: "generic" };

  const token = String(formData.get("token") ?? "");
  const parsed = newPasswordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!parsed.success) return { error: "weak" };
  if (!token) return { error: "invalid" };

  const result = await resetPassword(token, parsed.data);
  if (result === "invalid") return { error: "invalid" };

  // Outside any try/catch: redirect() works by throwing.
  redirect("/login?reset=1");
}
