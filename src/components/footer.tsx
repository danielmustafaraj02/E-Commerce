import Link from "next/link";
import { db } from "@/lib/db";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { PaymentIcons } from "@/components/payment-icons";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

type SocialLinks = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
};

type PaymentMethods = {
  cards: boolean;
  paypal: boolean;
  klarna: boolean;
  bankTransfer: boolean;
  cashOnDelivery: boolean;
};

// Small, self-drawn glyphs (no external icon font/CDN) — generic enough not
// to be exact logo reproductions, same approach as payment-icons.tsx.
function SocialIcon({ platform }: { platform: keyof SocialLinks }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };
  switch (platform) {
    case "facebookUrl":
      return (
        <svg {...common} fill="currentColor">
          <path d="M14 22v-8h2.7l.4-3.2H14V8.7c0-.9.3-1.6 1.6-1.6H17V4.2C16.6 4.1 15.6 4 14.5 4 12 4 10.3 5.6 10.3 8.4v2.4H7.6V14h2.7v8h3.7Z" />
        </svg>
      );
    case "instagramUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "twitterUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "tiktokUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 4c.4 2.4 2 4 4.5 4.3" />
        </svg>
      );
    case "youtubeUrl":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
          <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedinUrl":
      return (
        <svg {...common} fill="currentColor">
          <rect x="4" y="9" width="3" height="11" />
          <circle cx="5.5" cy="5" r="1.8" />
          <path d="M11 9h3v1.8c.6-1 1.8-2.1 3.5-2.1 2.8 0 4 1.9 4 5V20h-3v-5.7c0-1.5-.5-2.5-1.9-2.5-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V20h-3V9Z" />
        </svg>
      );
  }
}

const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  facebookUrl: "Facebook",
  instagramUrl: "Instagram",
  twitterUrl: "X",
  tiktokUrl: "TikTok",
  youtubeUrl: "YouTube",
  linkedinUrl: "LinkedIn",
};

export async function Footer({
  storeName,
  contactEmail,
  social,
  payments,
  dict,
}: {
  storeName: string;
  contactEmail: string;
  social: SocialLinks;
  payments: PaymentMethods;
  dict: Dictionary;
}) {
  const categories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    take: 6,
  });

  const legalLinks = [
    { slug: "returns", label: dict.footer.returns },
    { slug: "terms", label: dict.footer.terms },
    { slug: "privacy", label: dict.footer.privacy },
    { slug: "cookies", label: dict.footer.cookies },
  ];

  const socialEntries = (Object.keys(SOCIAL_LABELS) as (keyof SocialLinks)[])
    .map((key) => ({ key, href: social[key], label: SOCIAL_LABELS[key] }))
    .filter((entry): entry is { key: keyof SocialLinks; href: string; label: string } =>
      Boolean(entry.href)
    );

  const hasPayments =
    payments.cards ||
    payments.paypal ||
    payments.klarna ||
    payments.bankTransfer ||
    payments.cashOnDelivery;

  return (
    <footer className="border-foreground/10 bg-foreground/[0.015] border-t">
      <div className="mx-auto w-full max-w-5xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <Link href="/" className="text-lg font-semibold">
              {storeName}
            </Link>
            <p className="text-foreground/60 max-w-[26ch] text-sm">{dict.footer.tagline}</p>
            {socialEntries.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {socialEntries.map((entry) => (
                  <a
                    key={entry.key}
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={entry.label}
                    title={entry.label}
                    className="border-foreground/10 text-foreground/60 hover:border-primary hover:text-primary flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                  >
                    <SocialIcon platform={entry.key} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium">{dict.footer.shopHeading}</h3>
            <ul className="text-foreground/70 mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  {dict.footer.allProducts}
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">{dict.footer.helpHeading}</h3>
            <ul className="text-foreground/70 mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {dict.footer.contact}
                </Link>
              </li>
              {legalLinks.map((link) => (
                <li key={link.slug}>
                  <Link href={`/legal/${link.slug}`} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-medium">{dict.footer.companyHeading}</h3>
              <ul className="text-foreground/70 mt-4 flex flex-col gap-2.5 text-sm">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    {dict.footer.about}
                  </Link>
                </li>
                <li>
                  <Link href="/murano-glass" className="hover:text-primary transition-colors">
                    {dict.footer.muranoGuide}
                  </Link>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                    {contactEmail}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">{dict.footer.newsletterTitle}</h3>
              <p className="text-foreground/60 mt-1.5 text-xs">{dict.footer.newsletterBody}</p>
              <div className="mt-3">
                <NewsletterSignupForm dict={dict.footer} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasPayments && (
        <div className="border-foreground/10 mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 border-t px-4 py-5">
          <span className="text-foreground/60 text-xs font-medium tracking-wide uppercase">
            {dict.footer.weAccept}
          </span>
          <PaymentIcons {...payments} />
        </div>
      )}

      <div className="border-foreground/10 border-t">
        <p className="text-foreground/60 mx-auto w-full max-w-5xl px-4 py-6 text-sm">
          &copy; {new Date().getFullYear()} {storeName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
