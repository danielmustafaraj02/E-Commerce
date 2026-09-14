import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AboutPage() {
  const [settings, locale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(locale);

  const values = [
    { title: dict.about.value1Title, body: dict.about.value1Body },
    { title: dict.about.value2Title, body: dict.about.value2Body },
    { title: dict.about.value3Title, body: dict.about.value3Body },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">{dict.about.title}</h1>
      <p className="text-foreground/80 max-w-2xl text-lg">{dict.about.intro(settings.storeName)}</p>

      <h2 className="mt-12 mb-4 text-xl font-medium">{dict.about.heritageTitle}</h2>
      <div className="text-foreground/80 flex flex-col gap-4 text-sm leading-relaxed">
        <p>{dict.about.heritageBody1}</p>
        <p>{dict.about.heritageBody2}</p>
      </div>

      <h2 className="mt-12 mb-6 text-xl font-medium">{dict.about.valuesTitle}</h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="border-foreground/10 rounded border p-5">
            <h3 className="mb-2 font-medium">{value.title}</h3>
            <p className="text-foreground/70 text-sm">{value.body}</p>
          </div>
        ))}
      </div>

      <p className="text-foreground/70 mt-12 text-sm">
        {dict.about.contactCta}
        <Link href="/contact" className="text-primary underline">
          {dict.about.contactLink}
        </Link>
      </p>
    </main>
  );
}
