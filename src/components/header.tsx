import Image from "next/image";
import { Link } from "@/components/localized-link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CartLink } from "@/components/cart-link";
import { CartFlyout, WishlistFlyout } from "@/components/header-flyout";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNavMenu } from "@/components/mobile-nav-menu";
import { ProductsDropdown } from "@/components/products-dropdown";
import { HeaderSearch } from "@/components/search-overlay";
import { HeaderHeight } from "@/components/header-height";
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
    // Categories have no image of their own (see model Category in
    // prisma/schema.prisma), so each dropdown thumbnail borrows a product's
    // first picture: the cover product picked in Admin > Categories, else —
    // when none is set, or it has no photo — that category's OLDEST active
    // product. Oldest, not newest, so the tile doesn't silently change every
    // time a piece is added, and because it is the fallback the homepage
    // "Shop by category" shelf already used (lib/homepage-data.ts): with the
    // two ordered differently, an unpinned category showed one photo in the
    // menu and a different one on the homepage.
    // `position: "asc"` + `createdAt: "asc"` keeps it to one image per
    // category: we ask for one product row, and Prisma returns exactly one
    // image on it.
    db.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 8,
      select: {
        slug: true,
        name: true,
        nameEn: true,
        nameFr: true,
        nameDe: true,
        nameAr: true,
        nameZh: true,
        nameRu: true,
        nameEs: true,
        namePt: true,
        nameHi: true,
        nameJa: true,
        coverProduct: {
          select: {
            active: true,
            unlisted: true,
            images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
          },
        },
        products: {
          where: { active: true, unlisted: false },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          take: 1,
          select: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    }),
  ]);

  // Narrow the query result to what the two nav rows need: an href, a
  // localized label, and an optional thumbnail.
  const categoryLinks = categories.map((category) => {
    // A cover product that has since been deactivated or unlisted is ignored
    // here rather than shown: the storefront must not advertise it.
    const cover = category.coverProduct;
    const coverUrl =
      cover && cover.active && !cover.unlisted ? (cover.images[0]?.url ?? null) : null;
    return {
      href: `/category/${category.slug}`,
      label: localizedName(category, locale),
      imageUrl: coverUrl ?? category.products[0]?.images[0]?.url ?? null,
    };
  });

  const isStaff = session?.user.role === "admin" || session?.user.role === "staff";

  const wishlistCount = session?.user?.id
    ? await db.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  // Full ink, not foreground/80: at 80% the bottle green drops from 11.3:1 to
  // 6.2:1 on the ivory ground, which a light serif at ~1rem reads as washed
  // out rather than quiet. The restraint comes from the size and the slow
  // underline draw, not from fading the text.
  const navChipClass = "nav-link link-underline text-foreground shrink-0";
  // Same reasoning for the right-hand cluster (admin, sign in, register).
  const clusterLinkClass = "link-underline text-foreground transition-colors";

  // Flyout copy, shared by the cart and wishlist panels. All of it already
  // exists in the dictionary for the 11 locales — the panels are new, the
  // words are the storefront's.
  const flyoutLabels = {
    title: dict.wishlist.title,
    empty: dict.cart.empty,
    remove: dict.cart.remove,
    viewAll: dict.footer.allProducts,
    itemCount: dict.wishlist.itemCount,
    subtotal: dict.checkout.subtotal,
    checkout: dict.cart.checkout,
  };

  // The wishlist flyout gets its own empty line — reusing the cart's "your
  // cart is empty" inside the wishlist panel read as a bug.
  const wishlistFlyoutLabels = {
    ...flyoutLabels,
    empty: dict.wishlist.empty,
  };

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
    // The collections are NOT in this list: the menu renders them as its own
    // thumbnail rows (categories prop), so they would otherwise appear twice.
    { href: "/looks", label: dict.looks.navLabel },
    { href: "/about", label: dict.footer.about, secondary: true },
  ];

  // The blur only matters where the header is sticky (sm and up); on phones
  // it scrolls away anyway, and the backdrop-filter was a rendering cost.
  // The hairline under the bar uses the project's shared --hairline token, so the
  // header reads as a distinct band from the page it scrolls over.
  return (
    <header
      className="site-header relative z-40 bg-background sm:sticky sm:top-0"
      /* The store chrome's face: Apple's "New York" system serif where it
         exists, with serif fallbacks elsewhere. Set on the header so every
         nav link, chip and account/cart label inherits it; descendants can
         still override where a control genuinely needs the UI face. */
      style={{ fontFamily: "var(--font-chrome)" }}
    >
      {/* Reports the header's measured height to CSS, so the hero below can
          fill exactly the rest of the first screen. */}
      <HeaderHeight />
      <div className="mx-auto flex w-full max-w-7xl items-center gap-7 px-4 py-4 sm:px-6 sm:py-3.5">

        {/* ── Logo (far left, desktop only — mobile has its own centered logo below) ── */}
        <Link href="/" className="hidden shrink-0 self-stretch items-center lg:flex">
          <Image
            src={headerLogoSrc(logoUrl)}
            alt={storeName}
            width={284}
            height={168}
            sizes="108px"
            fetchPriority="high"
            className="h-16 w-auto object-contain mix-blend-multiply"
          />
        </Link>

        {/* ── Category nav (desktop, right of logo) ─────────────────────────
            Keep overflow visible so the Products menu can extend below the
            header. A scroll container clips absolutely positioned descendants,
            even when overflow-y is set to visible. ── */}
        <nav className="hidden min-w-0 items-center gap-6 text-[1.02rem] font-medium tracking-[0.01em] whitespace-nowrap lg:flex">
          <ProductsDropdown
            categories={categoryLinks}
            label={dict.nav.products}
            viewAllLabel={dict.nav.viewAll}
            eyebrow={dict.nav.collectionsEyebrow}
            locale={locale}
            signedIn={Boolean(session?.user)}
          />
          <Link href="/looks" className={navChipClass}>
            {dict.looks.navLabel}
          </Link>
          <Link href="/about" className={navChipClass}>
            {dict.footer.about}
          </Link>
        </nav>

        {/* ── Spacer pushes everything after here to the right (desktop only) ── */}
        <div className="hidden flex-1 lg:block" />

        {/* ── Search: a magnifier that unfolds into a field ───────────────── */}
        <div className="hidden lg:flex">
          <HeaderSearch placeholder={dict.nav.searchPlaceholder} label={dict.nav.search} />
        </div>

        {/* ── Icon cluster (locale, wishlist, cart, admin, account/login) ── */}
        <div className="hidden items-center gap-x-4 text-[1.02rem] font-medium tracking-[0.01em] whitespace-nowrap lg:flex">
          <LocaleSwitcher current={locale} />
          {session?.user ? (
            // Signed-in: the wishlist is DB-backed, so the header keeps the
            // server count and the plain link — the flyout reads the
            // device-local guest store, which would show the wrong list.
            <Link
              href="/account/wishlist"
              aria-label={dict.nav.wishlist}
              title={dict.nav.wishlist}
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
                className="transition-transform duration-200 ease-out group-hover:-rotate-12 group-hover:scale-125"
                aria-hidden="true"
              >
                <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
              </svg>
              {wishlistCount > 0 ? <span>({wishlistCount})</span> : null}
            </Link>
          ) : (
            <WishlistFlyout
              label={dict.nav.wishlist}
              labels={wishlistFlyoutLabels}
              locale={locale}
              signedIn={false}
            />
          )}
          <CartFlyout label={dict.nav.cart} labels={flyoutLabels} locale={locale} />
          {isStaff && (
            <Link
              href="/admin"
              className={`${clusterLinkClass} hover:text-accent`}
            >
              {dict.nav.admin}
            </Link>
          )}
          {session?.user ? (
            <Link
              href="/account"
              aria-label={dict.nav.account}
              title={dict.nav.account}
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
              <Link
                href="/login"
                className={`${clusterLinkClass} hover:text-accent`}
              >
                {dict.nav.signIn}
              </Link>
              <span className="hidden 2xl:inline">
                <Link
                  href="/register"
                  className={`${clusterLinkClass} hover:text-accent`}
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
              categories={categoryLinks}
              logoUrl={headerLogoSrc(logoUrl)}
              menuLabel={dict.nav.menu}
              closeLabel={dict.nav.closeMenu}
              searchPlaceholder={dict.nav.searchPlaceholder}
              searchLabel={dict.nav.search}
              storeName={storeName}
              social={social}
              socialLabel={dict.footer.socialNav}
              legal={legalLinks(dict)}
              legalLabel={dict.footer.legalNav}
            />
          </div>
          <Link href="/" className="flex items-center justify-center">
            <Image
              src={headerLogoSrc(logoUrl)}
              alt={storeName}
              width={284}
              height={168}
              sizes="101px"
              fetchPriority="high"
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
