import { headers } from "next/headers";
import { turnstileSiteKey } from "@/lib/turnstile";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import RegisterForm from "./register-form";

export default async function RegisterPage() {
  const [nonce, locale, siteKey] = await Promise.all([
    headers().then((h) => h.get("x-nonce") ?? undefined),
    getLocale(),
    turnstileSiteKey(),
  ]);
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">{dict.auth.createAccountTitle}</h1>
      <RegisterForm siteKey={siteKey} nonce={nonce} dict={dict.auth} />
      <p className="text-foreground/70 mt-4 text-sm">
        {dict.auth.haveAccount}{" "}
        <a href="/login" className="text-primary underline">
          {dict.auth.signIn}
        </a>
      </p>
    </main>
  );
}
