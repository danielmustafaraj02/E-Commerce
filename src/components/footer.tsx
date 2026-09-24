import Link from "next/link";
import { db } from "@/lib/db";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { localizedName } from "@/lib/product-i18n";
import { buildFooterNav } from "@/lib/footer-nav";
import { PaymentIcons } from "@/components/payment-icons";
import { CatalogImage } from "@/components/catalog-image";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";
import { FooterAccordion } from "@/components/footer-accordion";
import { SocialLinks, type SocialUrls } from "@/components/social-links";
import { BrandSignature, BrandWave } from "@/components/brand-signature";
import { homeFontClasses } from "@/app/home-fonts";
import "./footer.css";

type PaymentMethods = {
  cards: boolean;
  paypal: boolean;
  klarna: boolean;
  bankTransfer: boolean;
};

// Emerald Waves Necklace; falls back to the hero photo if it's ever removed.
const FOOTER_PRODUCT_SLUG = "collana-onde-di-smeraldo-143dbf";

// Small line icons for the trust strip, drawn in currentColor.
const TRUST_ICONS = {
  handcrafted: (
    <path d="M4 16c3-1 5-3 7-6l3-4c1-1 2.5-.5 2 1l-2 4h5c1 0 1.5 1.2.7 1.9L14 18c-2 1.6-6 2-10 1" />
  ),
  secure: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9Zm0 0c2-4 6-4 6-1.5S14 9 12 9Z" />
    </>
  ),
  shipping: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17" cy="17.5" r="1.5" />
    </>
  ),
};

export async function Footer({
  storeName,
  contactEmail,
  shippingBanner,
  social,
  payments,
  dict,
  locale,
}: {
  storeName: string;
  contactEmail: string;
  shippingBanner: string | null;
  social: SocialUrls;
  payments: PaymentMethods;
  dict: Dictionary;
  locale: Locale;
}) {
  const [categories, featured] = await Promise.all([
    db.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 6,
    }),
    // The piece shown beside "Discover the world of Murano glass".
    db.product.findUnique({
      where: { slug: FOOTER_PRODUCT_SLUG },
      select: { images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } },
    }),
  ]);
  const featuredImage = featured?.images[0]?.url ?? "/hero/handmade-red-murano-glass-necklace.jpg";
  const f = dict.footer;
  const nav = buildFooterNav({
    dict,
    categories: categories.map((c) => ({ slug: c.slug, label: localizedName(c, locale) })),
    contactEmail,
  });
  const trust = [
    { key: "handcrafted", label: f.trustHandcrafted },
    { key: "secure", label: dict.product.secureBadge },
    { key: "gift", label: f.trustGift },
    { key: "shipping", label: f.trustShipping },
  ] as const;
  const hasPayments = payments.cards || payments.paypal || payments.klarna || payments.bankTransfer;

  return (
    <footer className={`site-footer ${homeFontClasses}`}>
      <div className="site-footer-top">
        <section className="footer-editorial">
          <div className="footer-editorial-text">
            <BrandWave className="footer-wave" />
            <h2 className="footer-display">{f.editorialTitle}</h2>
            <p>{f.editorialText}</p>
            <Link href="/blog" className="footer-outline-button">
              {f.editorialCta} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="footer-editorial-image" aria-hidden="true">
            <CatalogImage src={featuredImage} alt="" fill sizes="(min-width: 48rem) 20rem, 40vw" />
          </div>
        </section>

        <section className="footer-newsletter">
          <h2 className="footer-display">{f.newsletterHeading}</h2>
          <p>{f.newsletterIntro}</p>
          <NewsletterSignupForm dict={f} />
          <p className="footer-fineprint">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="1.5" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            {f.newsletterPrivacy}
          </p>
        </section>
      </div>

      <div className="site-footer-body">
        <FooterAccordion sections={nav.sections} />

        <ul className="footer-trust">
          {trust.map((item) => (
            <li key={item.key}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {TRUST_ICONS[item.key]}
              </svg>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        {shippingBanner && <p className="footer-shipping">{shippingBanner}</p>}
      </div>

      <div className="site-footer-bottom">
        <SocialLinks urls={social} label={f.socialNav} />

        {hasPayments && (
          <div className="footer-payments">
            <span>{f.weAccept}</span>
            <PaymentIcons {...payments} labels={{ bankTransfer: dict.payment.bankTransfer }} />
          </div>
        )}

        <nav aria-label={f.legalNav}>
          <ul className="footer-legal">
            {nav.legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} <span translate="no">{storeName}</span>. {f.rights}
        </p>

        <BrandSignature storeName={storeName} />
      </div>
    </footer>
  );
}
