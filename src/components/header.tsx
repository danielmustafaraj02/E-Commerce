import { Link } from "@/components/localized-link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CartLink } from "@/components/cart-link";
import { GuestWishlistLink } from "@/components/guest-wishlist-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { ProductsDropdown } from "@/components/products-dropdown";
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
    }),
  ]);

  const isStaff = session?.user.role === "admin" || session?.user.role === "staff";

  const wishlistCount = session?.user?.id
    ? await db.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  const navChipClass =
    "nav-link link-underline text-foreground/80 hover:text-accent shrink-0 transition-colors";

  // Same destinations as the desktop row below, for the full-screen mobile
  // menu (MobileNavMenu) — resolved here since it needs plain strings, not
  // JSX, and this component already has locale/dict in scope. This is now
  // the *only* path to Account/Wishlist/Sign-in below the lg breakpoint,
  // since the header's own icon cluster is hidden there — see `account: true`.
  const mobileNavLinks = [
    session?.user
      ? {
          href: "/account/wishlist",
          label:
            wishlistCount > 0 ? `${dict.nav.wishlist} (${wishlistCount})` : dict.nav.wishlist,
          account: true,
        }
      : { href: "/wishlist", label: dict.nav.wishlist, account: true },
    session?.user
      ? { href: "/account", label: dict.nav.account, account: true }
      : { href: "/login", label: dict.nav.signIn, account: true },
    ...categories.map((category) => ({
      href: `/category/${category.slug}`,
      label: localizedName(category, locale),
    })),
    { href: "/looks", label: dict.looks.navLabel },
    { href: "/about", label: dict.footer.about, secondary: true },
    { href: "/murano-glass", label: dict.footer.muranoGuide, secondary: true },
  ];

  // The blur only matters where the header is sticky (sm and up); on phones
  // it scrolls away anyway, and the backdrop-filter was a rendering cost.
  return (
    <header className="glass-rule bg-background/90 relative z-40 sm:sticky sm:top-0 sm:backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-7 px-4 py-4 sm:px-6 sm:py-3.5">

        {/* ── Logo (far left, desktop only — mobile has its own centered logo below) ── */}
        <Link href="/" className="hidden shrink-0 self-stretch items-center lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={headerLogoSrc(logoUrl)}
            alt={storeName}
            width={284}
            height={168}
            className="h-16 w-auto object-contain mix-blend-multiply"
          />
        </Link>

        {/* ── Category nav (desktop, right of logo) ─────────────────────────
            overflow-x-auto + scrollbar-hide + edge-fade-x: the dropdown trigger
            below keeps this row narrow, but Looks/About/Guide alongside it can
            still outgrow the available width just past 1024px before the
            spacer/search/icon-cluster claim theirs; this scrolls instead of
            wrapping or squeezing, with the mask signaling more content. ── */}
        <nav className="hidden min-w-0 items-center gap-6 overflow-x-auto text-[0.95rem] whitespace-nowrap scrollbar-hide edge-fade-x lg:flex">
          <ProductsDropdown
            categories={categories.map((category) => ({
              href: `/category/${category.slug}`,
              label: localizedName(category, locale),
            }))}
            label={dict.nav.products}
            viewAllLabel={dict.nav.viewAll}
          />
          <Link href="/looks" className={navChipClass}>
            {dict.looks.navLabel}
          </Link>
          <Link href="/about" className={navChipClass}>
            {dict.footer.about}
          </Link>
          <Link href="/murano-glass" className={navChipClass}>
            {dict.footer.muranoGuide}
          </Link>
        </nav>

        {/* ── Spacer pushes everything after here to the right (desktop only) ── */}
        <div className="hidden flex-1 lg:block" />

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <form
          action="/products"
          method="GET"
          role="search"
          className="relative hidden items-center lg:flex"
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
            className="field w-44 min-w-0 rounded-md py-2 ps-10 pe-3 text-sm shadow-none xl:w-52"
          />
        </form>

        {/* ── Icon cluster (locale, wishlist, cart, admin, account/login) ── */}
        <div className="hidden items-center gap-x-4 text-[0.95rem] whitespace-nowrap lg:flex">
          <LocaleSwitcher current={locale} />
          {session?.user ? (
            <Link
              href="/account/wishlist"
              aria-label={dict.nav.wishlist}
              title={dict.nav.wishlist}
              className="group link-underline text-foreground/80 hover:text-danger flex items-center gap-1 transition-colors"
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
              <Link
                href="/login"
                className="link-underline text-foreground/80 hover:text-accent transition-colors"
              >
                {dict.nav.signIn}
              </Link>
              <span className="hidden 2xl:inline">
                <Link
                  href="/register"
                  className="link-underline text-foreground/80 hover:text-accent transition-colors"
                >
                  {dict.nav.register}
                </Link>
              </span>
            </>
          )}
        </div>

        {/* ── Mobile: hamburger — logo — cart, logo stays the visual focus ──
            lg:hidden: this compact row (and its hamburger menu, which now
            also carries search + account/wishlist/sign-in) is the only header
            below 1024px — the desktop row above no longer partially overlaps
            it at 640-1023px. ── */}
        <div className="grid w-full grid-cols-3 items-center lg:hidden">
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
              className="h-15 w-auto object-contain mix-blend-multiply"
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
