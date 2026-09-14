import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NotFound() {
  const dict = getDictionary(await getLocale());

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="mt-2 text-2xl font-semibold">{dict.notFound.title}</h1>
      <p className="text-foreground/70 mt-2 text-sm">{dict.notFound.body}</p>
      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/" className="bg-primary rounded px-4 py-2 text-white">
          {dict.notFound.backHome}
        </Link>
        <Link href="/products" className="border-foreground/20 rounded border px-4 py-2">
          {dict.notFound.browseProducts}
        </Link>
      </div>
    </main>
  );
}
