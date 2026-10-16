"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/components/localized-link";
import { WishlistFlyout } from "@/components/header-flyout";
import { LOCAL_ACCOUNTS_ENABLED } from "@/lib/local-features";
import type { Locale } from "@/lib/i18n/locale-constants";
import { useViewer } from "@/components/viewer";

// The header's visitor-dependent links: wishlist (with its count once signed
// in), Admin for staff, and account or sign-in. The header itself is part of
// cached pages, the same for everyone, so these fill in from /api/viewer once
// the page loads; until then they show the signed-out state the page was
// cached with.
export function HeaderAccount({
  locale,
  labels,
  wishlistFlyoutLabels,
  cart,
  clusterLinkClass,
}: {
  locale: Locale;
  labels: { wishlist: string; admin: string; account: string; signIn: string; register: string };
  wishlistFlyoutLabels: ComponentProps<typeof WishlistFlyout>["labels"];
  cart: ReactNode;
  clusterLinkClass: string;
}) {
  const viewer = useViewer();
  return (
    <>
      {viewer?.signedIn ? (
        // Signed-in: the wishlist is the account's, so the header shows its
        // count and the plain link — the flyout reads the device-local guest
        // store, which would show the wrong list.
        <Link
          href="/account/wishlist"
          aria-label={labels.wishlist}
          title={labels.wishlist}
          className="group link-underline text-foreground hover:text-danger flex items-center gap-1 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 ease-out group-hover:scale-125 group-hover:-rotate-12"
            aria-hidden="true"
          >
            <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
          </svg>
          {viewer.wishlistCount > 0 ? <span>({viewer.wishlistCount})</span> : null}
        </Link>
      ) : (
        <WishlistFlyout
          label={labels.wishlist}
          labels={wishlistFlyoutLabels}
          locale={locale}
          signedIn={false}
        />
      )}
      {cart}
      {LOCAL_ACCOUNTS_ENABLED && viewer?.isStaff && (
        <Link href="/admin" className={`${clusterLinkClass} hover:text-accent`}>
          {labels.admin}
        </Link>
      )}
      {LOCAL_ACCOUNTS_ENABLED &&
        (viewer?.signedIn ? (
          <Link
            href="/account"
            aria-label={labels.account}
            title={labels.account}
            className="group link-underline text-foreground hover:text-accent flex items-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" />
            </svg>
          </Link>
        ) : (
          <>
            <Link href="/login" className={`${clusterLinkClass} hover:text-accent`}>
              {labels.signIn}
            </Link>
            <span className="hidden 2xl:inline">
              <Link href="/register" className={`${clusterLinkClass} hover:text-accent`}>
                {labels.register}
              </Link>
            </span>
          </>
        ))}
    </>
  );
}
