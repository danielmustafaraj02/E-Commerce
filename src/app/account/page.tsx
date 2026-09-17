import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { StatusBadge } from "@/components/status-badge";
import { DeleteAccountForm } from "./delete-account-form";
import { ResendVerificationForm } from "./resend-verification-form";
import { FormAlert } from "@/components/form-alert";
import { ConfettiBurst } from "@/components/confetti-burst";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; welcome?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [settings, uiLocale, user, wishlistPreview, { verified, welcome }] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { _count: { select: { items: true } } },
        },
      },
    }),
    db.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } },
    }),
    searchParams,
  ]);
  if (!user) redirect("/login");
  const dict = getDictionary(uiLocale);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <div className="from-primary/15 via-secondary/10 to-primary/0 border-primary/10 relative flex items-center gap-4 rounded-xl border bg-gradient-to-br px-6 py-6">
        <div className="from-primary to-secondary flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white shadow-sm">
          {(user.name || user.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{user.name || dict.account.title}</h1>
          <p className="text-foreground/70 text-sm">{dict.account.signedInAs(session.user.email!)}</p>
        </div>
        {welcome === "1" && <ConfettiBurst />}
      </div>

      {verified === "1" && (
        <div className="mt-4">
          <FormAlert type="success">Email confirmed — thanks!</FormAlert>
        </div>
      )}
      {verified === "expired" && (
        <div className="mt-4">
          <FormAlert type="error">
            That confirmation link expired. Request a new one below.
          </FormAlert>
        </div>
      )}

      {!user.emailVerified && (
        <div className="border-warning/30 bg-warning/5 mt-6 rounded-lg border p-4">
          <p className="text-sm">
            Please confirm your email address — check your inbox for a confirmation link.
          </p>
          <ResendVerificationForm />
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M21 8 12 3 3 8l9 5 9-5Z" />
            <path d="M3 8v8l9 5 9-5V8" />
            <path d="M12 13v8" />
          </svg>
          {dict.account.orderHistory}
        </h2>
        {user.orders.length === 0 ? (
          <div className="border-foreground/10 bg-surface rounded-lg border px-6 py-10 text-center">
            <p className="text-foreground/70 text-sm">{dict.account.noOrders}</p>
          </div>
        ) : (
          <ul className="border-foreground/10 bg-surface divide-foreground/10 flex flex-col divide-y overflow-hidden rounded-lg border">
            {user.orders.map((order) => (
              <li key={order.id} className="p-4">
                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="hover:text-primary text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-foreground/60 mt-0.5 text-xs">
                      {new Intl.DateTimeFormat(settings.defaultLocale, { dateStyle: "medium" }).format(
                        order.createdAt
                      )}{" "}
                      &middot; {order._count.items} {order._count.items === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium">
                      {formatMoney(order.total, order.currency, settings.defaultLocale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-danger"
              aria-hidden="true"
            >
              <path d="M20.8 4.6c-1.9-1.6-4.6-1.4-6.3.4L12 7.5l-2.5-2.5c-1.7-1.8-4.4-2-6.3-.4-2.1 1.8-2.2 5-.3 6.9L12 21l9.1-9.5c1.9-1.9 1.8-5.1-.3-6.9Z" />
            </svg>
            {dict.account.wishlist}
          </h2>
          <Link href="/account/wishlist" className="text-primary text-sm hover:underline">
            {dict.account.viewWishlist}
          </Link>
        </div>
        {wishlistPreview.length === 0 ? (
          <div className="border-foreground/10 bg-surface rounded-lg border px-6 py-8 text-center">
            <p className="text-foreground/70 text-sm">{dict.wishlist.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {wishlistPreview.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.product.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg"
              >
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].altText || item.product.name}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="bg-surface h-full w-full" />
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/account/mfa"
          className="border-foreground/10 hover:border-warning/40 hover:bg-warning/5 flex items-start gap-3 rounded-lg border p-4 transition-colors"
        >
          <div className="bg-warning/10 text-warning flex size-9 shrink-0 items-center justify-center rounded-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3 4.5 6v6c0 4.5 3.1 7.7 7.5 9 4.4-1.3 7.5-4.5 7.5-9V6L12 3Z" />
              <path d="m9.5 12 1.8 1.8L15 10" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-medium">{dict.account.security}</h2>
            <p className="text-warning mt-1 text-sm">
              {user.mfaEnabled ? dict.account.manageMfa : dict.account.enableMfa}
            </p>
          </div>
        </Link>
        <a
          href="/api/account/export"
          className="border-foreground/10 hover:border-secondary/40 hover:bg-secondary/5 flex items-start gap-3 rounded-lg border p-4 transition-colors"
        >
          <div className="bg-secondary/10 text-secondary flex size-9 shrink-0 items-center justify-center rounded-full">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12m0 0-4-4m4 4 4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-medium">{dict.account.yourData}</h2>
            <p className="text-secondary mt-1 text-sm">{dict.account.downloadData}</p>
          </div>
        </a>
      </section>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-10"
      >
        <button type="submit" className="btn-secondary text-sm">
          {dict.account.signOut}
        </button>
      </form>

      <section className="border-foreground/10 mt-10 border-t pt-6">
        <h2 className="mb-3 text-lg font-medium">{dict.account.dangerZone}</h2>
        <DeleteAccountForm
          dict={{
            deleteAccount: dict.account.deleteAccount,
            deleteAccountWarning: dict.account.deleteAccountWarning,
            currentPassword: dict.account.currentPassword,
            deleting: dict.account.deleting,
            confirmDeletion: dict.account.confirmDeletion,
            cancel: dict.account.cancel,
          }}
        />
      </section>
    </main>
  );
}
