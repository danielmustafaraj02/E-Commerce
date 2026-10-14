import { requireAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/store-settings";
import { COLOR_ROLES } from "@/lib/site-style";
import { parseCustomPalettes } from "@/lib/color-palettes";
import { db } from "@/lib/db";
import { SiteStyleForm } from "./site-style-form";

// Admin > Settings > Site style: the eight colour roles and the type roles
// that every page, locale and control on the storefront reads.
export default async function AdminSiteStylePage() {
  await requireAdmin();
  const [settings, sample] = await Promise.all([
    getStoreSettings(),
    db.product.findFirst({
      where: { active: true, unlisted: false },
      orderBy: { createdAt: "desc" },
      select: { slug: true },
    }),
  ]);

  /* Only the style columns reach the client — the settings row also holds API
     keys and payment secrets, and none of that belongs in a form payload. */
  const style = {
    ...Object.fromEntries(COLOR_ROLES.map((role) => [role, settings[role] ?? null])),
    fontHeading: settings.fontHeading ?? null,
    fontBody: settings.fontBody ?? null,
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Site style</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-600">
        Colour and type for the whole storefront, by role. Changes are a draft until you save;
        saving applies them to every page and every language.
      </p>
      <SiteStyleForm
        style={style}
        customPalettes={parseCustomPalettes(settings.customPalettes)}
        previewPages={[
          { id: "home", label: "Home page", path: "" },
          { id: "products", label: "All products", path: "/products" },
          ...(sample
            ? [{ id: "product", label: "A product page", path: `/products/${sample.slug}` }]
            : []),
          { id: "about", label: "About us", path: "/about" },
          { id: "blog", label: "Journal", path: "/blog" },
          { id: "contact", label: "Contact", path: "/contact" },
          { id: "cart", label: "Cart", path: "/cart" },
        ]}
      />
    </div>
  );
}
