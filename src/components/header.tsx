import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CartLink } from "@/components/cart-link";
import { GuestWishlistLink } from "@/components/guest-wishlist-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export async function Header({
  storeName,
  logoUrl,
  locale,
  dict,
}: {
  storeName: string;
  logoUrl: string | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const [session, categories] = await Promise.all([
    auth(),
    db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" }, take: 8 }),
  ]);

  const isStaff = session?.user.role === "admin" || session?.user.role === "staff";

  const wishlistCount = session?.user?.id
    ? await db.wishlistItem.count({ where: { userId: session.user.id } })
    : 0;

  return (
    <header className="border-foreground/10 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            {logoUrl ? (
              // Plain <img>, not next/image: logoUrl is admin-settable and
              // could be an SVG (its own URL field, unrestricted by design —
              // see next.config.ts), which next/image's optimizer refuses by
              // default (a deliberate XSS guard) rather than being worth
              // reconfiguring for a fixed 32px mark.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded object-contain" />
            ) : null}
            {storeName}
          </Link>

          {/* flex-wrap (not shrink-0) so this cluster drops to its own line
              on narrow phones instead of clipping past the viewport edge —
              it was overflowing next to the store name at ~375px wide. */}
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm">
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
                className="link-underline text-foreground/80 hover:text-primary transition-colors"
              >
                {dict.nav.admin}
              </Link>
            )}
            {session?.user ? (
              <Link
                href="/account"
                aria-label={dict.nav.account}
                title={dict.nav.account}
                className="group link-underline text-foreground/80 hover:text-primary flex items-center"
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
                  className="link-underline text-foreground/80 hover:text-primary transition-colors"
                >
                  {dict.nav.signIn}
                </Link>
                <Link
                  href="/register"
                  className="link-underline text-foreground/80 hover:text-primary hidden transition-colors sm:inline"
                >
                  {dict.nav.register}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-4 overflow-x-auto text-sm whitespace-nowrap">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="link-underline text-foreground/80 hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="link-underline text-foreground/80 hover:text-primary transition-colors"
            >
              {dict.footer.about}
            </Link>
            <Link
              href="/murano-glass"
              className="link-underline text-foreground/80 hover:text-primary transition-colors"
            >
              {dict.footer.muranoGuide}
            </Link>
          </nav>

          <form action="/products" method="GET" className="relative flex items-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground/40 pointer-events-none absolute left-2.5"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6.5" />
              <path d="M18 18l-4-4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder={dict.nav.searchPlaceholder}
              className="field w-full min-w-0 py-1.5 pl-8 text-sm sm:w-56"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
