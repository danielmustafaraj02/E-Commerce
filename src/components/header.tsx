import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CartLink } from "@/components/cart-link";
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

  return (
    <header className="border-foreground/10 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={storeName}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-contain"
              />
            ) : null}
            {storeName}
          </Link>

          <div className="flex shrink-0 items-center gap-3 text-sm">
            <LocaleSwitcher current={locale} />
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
                className="link-underline text-foreground/80 hover:text-primary transition-colors"
              >
                {dict.nav.account}
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
