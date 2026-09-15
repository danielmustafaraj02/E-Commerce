import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ email: z.string().email() });

export default async function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
  const { email: raw } = await searchParams;
  const parsed = schema.safeParse({ email: Array.isArray(raw) ? raw[0] : raw });

  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="mb-2 text-xl font-semibold">Invalid unsubscribe link</h1>
        <p className="text-foreground/70 text-sm">
          This link is missing or has an invalid email address.
        </p>
      </main>
    );
  }

  const email = parsed.data.email.toLowerCase();
  await db.newsletterSubscriber.updateMany({
    where: { email },
    data: { unsubscribedAt: new Date() },
  });

  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="mb-2 text-xl font-semibold">You&apos;re unsubscribed</h1>
      <p className="text-foreground/70 text-sm">
        {email} won&apos;t receive newsletter emails anymore. You can subscribe again anytime from
        the homepage.
      </p>
    </main>
  );
}
