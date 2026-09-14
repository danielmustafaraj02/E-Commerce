import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(100).optional(),
});

export class RegistrationError extends Error {}

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    // Generic message on purpose — don't confirm which emails are registered.
    throw new RegistrationError("Unable to register with these details");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return db.user.create({
    data: { email: input.email, passwordHash, name: input.name, role: "customer" },
  });
}
