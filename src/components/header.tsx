import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CartLink } from "@/components/cart-link";
import { GuestWishlistLink } from "@/components/guest-wishlist-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import type { Locale } from "@/lib/i18n/locale";
import { localizedName } from "@/lib/product-i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { headerLogoSrc } from "@/lib/store-settings";
import { legalLinks } from "@/lib/footer-nav";
import type { SocialUrls } from "@/components/social-links";

export async function Header({
  storeName,
  logoUrl,
  locale,
  dict,
  social,
}: {
  storeName: string;
  logoUrl: string | null;
  locale: Locale;
  dict: Dictionary;
  social: SocialUrls;
}) {
  const [session, categories] = await Promise.all([
    auth(),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 8,
      // One piece's photo per category, for the mobile menu's thumbnails.
      include: {
        products: {
          where: { active: true },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } },
        },
      },
    }),
  ]);

  const isStaff = session?.user.role === "admin" || session?.user.role === "staff";

  const wishlistCount = session?.user?.id
    ? await db.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  const navChipClass =
    "nav-link link-underline text-foreground/80 hover:text-accent transition-colors";

  // Same destinations as the desktop row below, for the full-screen mobile
  // menu (MobileNavMenu) — resolved here since it needs plain strings, not
  // JSX, and this component already has locale/dict in scope.
  const mobileNavLinks = [
    ...categories.map((category) => ({
      href: `/category/${category.slug}`,
      label: localizedName(category, locale),
      imageUrl: category.products[0]?.images[0]?.url ?? null,
    })),
    { href: "/about", label: dict.footer.about, icon: "about" as const },
    { href: "/murano-glass", label: dict.footer.muranoGuide, icon: "guide" as const },
  ];

  return (
    <header className="glass-rule bg-background/90 relative z-40 backdrop-blur-sm sm:sticky sm:top-0">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-2 sm:py-2">

        {/* ── Logo (far left, desktop only — mobile has its own centered logo below) ── */}
        <Link href="/" className="hidden shrink-0 self-stretch items-center sm:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerLogoSrc(logoUrl)}
            alt={storeName}
            width={284}
            height={168}
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* ── Category nav (desktop, right of logo) ─────────────────────── */}
        <nav className="hidden items-center gap-4 text-sm whitespace-nowrap sm:flex">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className={navChipClass}>
              {localizedName(category, locale)}
            </Link>
          ))}
          <Link href="/about" className={navChipClass}>
            {dict.footer.about}
          </Link>
          <Link href="/murano-glass" className={navChipClass}>
            {dict.footer.muranoGuide}
          </Link>
        </nav>

        {/* ── Spacer pushes everything after here to the right (desktop only) ── */}
        <div className="hidden flex-1 sm:block" />

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <form
          action="/products"
          method="GET"
          role="search"
          className="relative hidden items-center sm:flex"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/50 pointer-events-none absolute start-3"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6.5" />
            <path d="M18 18l-4-4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            name="q"
            placeholder={dict.nav.searchPlaceholder}
            aria-label={dict.nav.searchPlaceholder}
            enterKeyHint="search"
            autoComplete="off"
            className="field w-56 min-w-0 rounded-xl py-1.5 ps-10 pe-3 text-sm shadow-none"
          />
        </form>

        {/* ── Icon cluster (locale, wishlist, cart, admin, account/login) ── */}
        <div className="hidden items-center gap-x-3 text-sm sm:flex">
          <LocaleSwitcher current={locale} />
          {session?.user ? (
            <Link
              href="/account/wishlist"
              aria-label={dict.nav.wishlist}
              title={dict.nav.wishlist}
              className="group link-underline text-foreground/80 hover:text-danger flex items-center gap-1 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 ease-out group-hover:-rotate-12 group-hover:scale-125"
                aria-hidden="true"
              >
                <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
              </svg>
              {wishlistCount > 0 ? <span>({wishlistCount})</span> : null}
            </Link>
          ) : (
            <GuestWishlistLink label={dict.nav.wishlist} />
          )}
          <CartLink label={dict.nav.cart} />
          {isStaff && (
            <Link
              href="/admin"
              className="link-underline text-foreground/80 hover:text-accent transition-colors"
            >
              {dict.nav.admin}
            </Link>
          )}
          {session?.user ? (
            <Link
              href="/account"
              aria-label={dict.nav.account}
              title={dict.nav.account}
              className="group link-underline text-foreground/80 hover:text-accent flex items-center"
            >
              <svg
                width="18"
                height="18"
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
              <Link
                href="/login"
                className="link-underline text-foreground/80 hover:text-accent transition-colors"
              >
                {dict.nav.signIn}
              </Link>
              <Link
                href="/register"
                className="link-underline text-foreground/80 hover:text-accent transition-colors"
              >
                {dict.nav.register}
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile: hamburger — logo — cart, logo stays the visual focus ── */}
        <div className="grid w-full grid-cols-3 items-center sm:hidden">
          <div className="flex items-center">
            <MobileNavMenu
              links={mobileNavLinks}
              menuLabel={dict.nav.menu}
              closeLabel={dict.nav.closeMenu}
              searchPlaceholder={dict.nav.searchPlaceholder}
              searchLabel={dict.nav.search}
              storeName={storeName}
              tagline={dict.footer.brandTagline}
              social={social}
              socialLabel={dict.footer.socialNav}
              legal={legalLinks(dict)}
              legalLabel={dict.footer.legalNav}
            />
          </div>
          <Link href="/" className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={headerLogoSrc(logoUrl)}
              alt={storeName}
              width={284}
              height={168}
              className="h-11 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center justify-end">
            <CartLink label={dict.nav.cart} />
          </div>
        </div>

      </div>
    </header>
  );
}
