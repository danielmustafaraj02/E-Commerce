import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { generateMfaSecret, getMfaUri } from "@/lib/mfa";
import { ConfirmMfaForm } from "./confirm-mfa-form";
import { DisableMfaForm } from "./disable-mfa-form";
import { ShelfMain } from "@/components/shelf-main";
import { ShelfHead, ShelfBody } from "@/components/shelf-page";

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/mfa");

  const { required } = await searchParams;

  const [settings, user] = await Promise.all([
    getStoreSettings(),
    db.user.findUnique({ where: { id: session.user.id } }),
  ]);
  if (!user) redirect("/login");

  const requiredNotice = required === "1" && (user.role === "admin" || user.role === "staff") && (
    <p className="border-primary/30 bg-primary/5 text-foreground mb-6 rounded-lg border p-3 text-sm">
      Two-factor authentication is required for admin/staff accounts before you can access the admin
      panel.
    </p>
  );

  if (user.mfaEnabled) {
    return (
      <ShelfMain>
        <ShelfHead title="Two-factor authentication" width="sm" />
        <ShelfBody width="sm">
          <p className="text-success mb-6 text-sm">
            Enabled — your account requires a code at sign-in.
          </p>
          <DisableMfaForm />
        </ShelfBody>
      </ShelfMain>
    );
  }

  // A fresh secret each time this page renders while MFA isn't enabled yet
  // — harmless if abandoned, and means reloading always gives a scannable
  // QR rather than a stale one.
  const secret = generateMfaSecret();
  await db.user.update({ where: { id: user.id }, data: { mfaSecret: secret } });
  const uri = getMfaUri(user.email, settings.storeName, secret);
  const qrDataUrl = await QRCode.toDataURL(uri);

  return (
    <ShelfMain>
      <ShelfHead title="Two-factor authentication" width="sm" />
      <ShelfBody width="sm">
        {requiredNotice}
        <p className="text-foreground/70 mb-6 text-sm">
          Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy), then
          enter the 6-digit code it shows to finish enabling MFA. You&apos;ll need to sign out and
          back in afterward for admin access to pick up the change.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="MFA QR code"
          className="mb-4 h-48 w-48 rounded-lg border border-[color:var(--rule)] bg-white p-2"
        />
        <p className="text-foreground/60 mb-6 text-xs break-all">Manual entry key: {secret}</p>
        <ConfirmMfaForm />
      </ShelfBody>
    </ShelfMain>
  );
}
