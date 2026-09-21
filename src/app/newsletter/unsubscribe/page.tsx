import { z } from "zod";
import { db } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { applyTemplate } from "@/lib/i18n/format";
import { ShelfMain } from "@/components/shelf-main";

const schema = z.object({ email: z.string().email() });

export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/newsletter/unsubscribe">) {
  const t = getDictionary(await getLocale()).feedback;
  const { email: raw } = await searchParams;
  const parsed = schema.safeParse({ email: Array.isArray(raw) ? raw[0] : raw });

  if (!parsed.success) {
    return (
      <ShelfMain>
        <div className="shelf-wrap shop-w-sm shop-center">
          <h1 className="shop-title">{t.unsubscribeInvalidTitle}</h1>
          <p className="shop-lede">{t.unsubscribeInvalidBody}</p>
        </div>
      </ShelfMain>
    );
  }

  const email = parsed.data.email.toLowerCase();
  await db.newsletterSubscriber.updateMany({
    where: { email },
    data: { unsubscribedAt: new Date() },
  });

  return (
    <ShelfMain>
      <div className="shelf-wrap shop-w-sm shop-center">
        <h1 className="shop-title">{t.unsubscribedTitle}</h1>
        <p className="shop-lede">{applyTemplate(t.unsubscribedBody, { email })}</p>
      </div>
    </ShelfMain>
  );
}
