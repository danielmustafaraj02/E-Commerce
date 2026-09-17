import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { formatMoney } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DeleteAccountForm } from "./delete-account-form";
import { ResendVerificationForm } from "./resend-verification-form";
import { FormAlert } from "@/components/form-alert";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [settings, uiLocale, user, { verified }] = await Promise.all([
    getStoreSettings(),
    getLocale(),
    db.user.findUnique({
      where: { id: session.user.id },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 20 } },
    }),
    searchParams,
  ]);
  if (!user) redirect("/login");
  const dict = getDictionary(uiLocale);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">{dict.account.title}</h1>
      <p className="text-foreground/70">{dict.account.signedInAs(session.user.email!)}</p>

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
        <h2 className="mb-3 text-lg font-medium">{dict.account.orderHistory}</h2>
        {user.orders.length === 0 ? (
          <p className="text-foreground/70 text-sm">{dict.account.noOrders}</p>
        ) : (
          <ul className="divide-foreground/10 flex flex-col divide-y text-sm">
            {user.orders.map((order) => (
              <li key={order.id} className="flex justify-between py-2">
                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="hover:text-primary"
                >
                  {order.orderNumber}
                </Link>
                <span className="text-foreground/70">{order.status}</span>
                <span>{formatMoney(order.total, order.currency, settings.defaultLocale)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-medium">{dict.account.wishlist}</h2>
        <Link href="/account/wishlist" className="text-primary text-sm hover:underline">
          {dict.account.viewWishlist}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-medium">{dict.account.security}</h2>
        <Link href="/account/mfa" className="text-primary text-sm hover:underline">
          {user.mfaEnabled ? dict.account.manageMfa : dict.account.enableMfa}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-medium">{dict.account.yourData}</h2>
        <a href="/api/account/export" className="text-primary text-sm hover:underline">
          {dict.account.downloadData}
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
        <DeleteAccountForm />
      </section>
    </main>
  );
}
