import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { generateMfaSecret, getMfaUri } from "@/lib/mfa";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
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
  if (!session?.user) {
    const locale = await getLocale();
    redirect(`/${locale}/login?callbackUrl=/${locale}/account/mfa`);
  }

  const { required } = await searchParams;

  const [settings, user, uiLocale] = await Promise.all([
    getStoreSettings(),
    db.user.findUnique({ where: { id: session.user.id } }),
    getLocale(),
  ]);
  if (!user) redirect(`/${uiLocale}/login`);
  const dict = getDictionary(uiLocale).mfa;

  const requiredNotice = required === "1" && (user.role === "admin" || user.role === "staff") && (
    <p className="border-primary/30 bg-primary/5 text-foreground mb-6 rounded-lg border p-3 text-sm">
      {dict.requiredNotice}
    </p>
  );

  if (user.mfaEnabled) {
    return (
      <ShelfMain>
        <ShelfHead title={dict.pageTitle} width="sm" />
        <ShelfBody width="sm">
          <p className="text-success mb-6 text-sm">{dict.enabledNotice}</p>
          <DisableMfaForm
            dict={{
              confirmPasswordLabel: dict.confirmPasswordLabel,
              disabling: dict.disabling,
              disableButton: dict.disableButton,
            }}
          />
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
      <ShelfHead title={dict.pageTitle} width="sm" />
      <ShelfBody width="sm">
        {requiredNotice}
        <p className="text-foreground/70 mb-6 text-sm">{dict.setupIntro}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={dict.qrAlt}
          className="mb-4 h-48 w-48 rounded-lg border border-[color:var(--rule)] bg-white p-2"
        />
        <p className="text-foreground/60 mb-6 text-xs break-all">{dict.manualEntryKey(secret)}</p>
        <ConfirmMfaForm
          dict={{
            codeLabel: dict.codeLabel,
            verifying: dict.verifying,
            enableButton: dict.enableButton,
          }}
        />
      </ShelfBody>
    </ShelfMain>
  );
}
