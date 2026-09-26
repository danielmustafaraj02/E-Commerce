import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hreflangAlternates, localizedCanonical } from "@/lib/hreflang";
import { turnstileSiteKey } from "@/lib/turnstile";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.contact.title,
    description: dict.contact.intro,
    alternates: {
      canonical: localizedCanonical(locale, "/contact"),
      languages: hreflangAlternates("/contact"),
    },
  };
}

export default async function ContactPage() {
  const [settings, locale, nonce, siteKey] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    headers().then((h) => h.get("x-nonce") ?? undefined),
    turnstileSiteKey(),
  ]);
  const dict = getDictionary(locale);

  return (
    <ShelfMain>
      <ShelfHead title={dict.contact.title}>
        <p className="shop-lede">{dict.contact.intro}</p>
      </ShelfHead>
      <ShelfBody>
        <div className="mb-10 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">{dict.contact.emailLabel}</p>
            <a href={`mailto:${settings.contactEmail}`} className="shelf-link">
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
      </ShelfBody>
    </ShelfMain>
  );
}
