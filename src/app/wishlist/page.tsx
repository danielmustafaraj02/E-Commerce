import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStoreSettings } from "@/lib/store-settings";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ShelfMain } from "@/components/shelf-main";
import { GuestWishlistClient } from "./guest-wishlist-client";

// Public counterpart to /account/wishlist for signed-out visitors — a
// signed-in user has a canonical, DB-backed wishlist there instead, so this
// just hands them off rather than maintaining two versions of the same page.
export default async function GuestWishlistPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/account/wishlist");

  const [settings, uiLocale] = await Promise.all([getStoreSettings(), getLocale()]);
  const dict = getDictionary(uiLocale);

  return (
    <ShelfMain>
      <GuestWishlistClient
        wishlistDict={dict.wishlist}
        addToCartLabel={dict.product.addToCart}
        locale={settings.defaultLocale}
      />
    </ShelfMain>
  );
}
