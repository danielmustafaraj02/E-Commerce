import { headers } from "next/headers";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { turnstileSiteKey } from "@/lib/turnstile";
import { ContactForm } from "./contact-form";

export default async function ContactPage() {
  const [settings, locale, nonce, siteKey] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    headers().then((h) => h.get("x-nonce") ?? undefined),
    turnstileSiteKey(),
  ]);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-2 text-3xl font-semibold">{dict.contact.title}</h1>
      <p className="text-foreground/70 mb-8">{dict.contact.intro}</p>

      <div className="mb-10 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium">{dict.contact.emailLabel}</p>
          <a href={`mailto:${settings.contactEmail}`} className="text-primary hover:underline">
            {settings.contactEmail}
          </a>
        </div>
        {settings.companyAddress && (
          <div>
            <p className="font-medium">{dict.contact.addressLabel}</p>
            <p className="text-foreground/70">{settings.companyAddress}</p>
          </div>
        )}
      </div>

      <ContactForm dict={dict.contact} siteKey={siteKey} nonce={nonce} />
    </main>
  );
}
