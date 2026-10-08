import type { ReactNode } from "react";
import { LayoutSection } from "@/components/layout-section";
import { PreviewBridge } from "@/components/layout-preview-bridge-server";
import { isLayoutPreview } from "@/lib/layout-preview-server";
import { pageEntries } from "@/lib/page-layout-store";
import type { CONTACT_SECTIONS } from "@/lib/page-layout";
import { withPageMeta } from "@/lib/page-meta";
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

async function baseMetadata(): Promise<Metadata> {
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

export async function generateMetadata(): Promise<Metadata> {
  return withPageMeta("/contact", await baseMetadata());
}

type ContactSectionId = (typeof CONTACT_SECTIONS)[number]["id"];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const preview = await isLayoutPreview(searchParams);
  const entries = await pageEntries("contact", { preview });
  const [settings, locale, nonce, siteKey] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    headers().then((h) => h.get("x-nonce") ?? undefined),
    turnstileSiteKey(),
  ]);
  const dict = getDictionary(locale);

  const sections: Record<ContactSectionId, ReactNode> = {
    head: (
      <ShelfHead title={dict.contact.title}>
        <p className="shop-lede">{dict.contact.intro}</p>
      </ShelfHead>
    ),
    form: (
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
    ),
  };

  return (
    <ShelfMain>
      {entries.map((entry) => (
        <LayoutSection key={entry.id} entry={entry} preview={preview}>
          {entry.custom ? null : sections[entry.id as ContactSectionId]}
        </LayoutSection>
      ))}
      {preview && <PreviewBridge target="contact" />}
    </ShelfMain>
  );
}
