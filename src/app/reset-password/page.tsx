import Link from "next/link";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isResetTokenValid } from "@/lib/password-reset";
import { FormAlert } from "@/components/form-alert";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  const [locale, settings, valid] = await Promise.all([
    getLocale(),
    getStoreSettings(),
    token ? isResetTokenValid(token) : false,
  ]);
  const dict = getDictionary(locale).auth;

  return (
    <main className="bg-surface relative flex flex-1 flex-col overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
        <h1 className="mb-1 text-center text-2xl font-semibold">{dict.resetPasswordTitle}</h1>
        <p className="text-foreground/60 mb-6 text-center text-sm">{settings.storeName}</p>
        {valid ? (
          <ResetPasswordForm token={token} dict={dict} />
        ) : (
          <div className="form-card flex flex-col gap-4">
            <FormAlert type="error">{dict.resetInvalid}</FormAlert>
            <Link href="/forgot-password" className="btn-primary text-center">
              {dict.requestNewLink}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
