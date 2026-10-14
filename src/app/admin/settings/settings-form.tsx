"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateStoreSettings } from "./actions";
import { FormAlert } from "@/components/form-alert";

type Settings = {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  defaultCurrency: string;
  defaultLocale: string;
  contactEmail: string;
  vatNumber: string | null;
  companyLegalName: string | null;
  companyAddress: string | null;
  pricesIncludeTax: boolean;
  freeShippingThreshold: number | null;
  trustBadgeText: string | null;
  showTestimonials: boolean;
  giftCardEnabled: boolean;
  giftCardPrice: number;
  siteUrl: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  googleSiteVerification: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateStoreSettings, {
    error: null as string | null,
    success: false,
  });

  return (
    <form action={formAction} className="form-card flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Store name
        <input name="storeName" required defaultValue={settings.storeName} className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Logo URL
        <input name="logoUrl" defaultValue={settings.logoUrl ?? ""} className="field" />
      </label>
      {/* The storefront's colours and typography moved to Settings > Site
          style, which controls them by ROLE. The three fields below are what
          is left of the older model and are kept because other things still
          read them — but they are not where the palette and the fonts live,
          and an admin looking for those needs to be sent there rather than
          left editing a field that no longer does what its label implies. */}
      <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
        <strong className="block">Colours and fonts live in Site style</strong>
        <p className="mt-1 text-neutral-600">
          Palette by role, named palettes, your own saved palettes and the font
          pairings are all in{" "}
          <Link href="/admin/settings/site-style" className="underline">
            Settings → Site style
          </Link>
          .
        </p>
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Primary color
          <input
            name="primaryColor"
            type="color"
            defaultValue={settings.primaryColor}
            className="field-color"
          />
          <span className="text-xs text-neutral-500">
            Legacy accent, still used by a few older components.
          </span>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Secondary color
          <input
            name="secondaryColor"
            type="color"
            defaultValue={settings.secondaryColor}
            className="field-color"
          />
          <span className="text-xs text-neutral-500">Legacy, as above.</span>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Font family
        <input name="fontFamily" required defaultValue={settings.fontFamily} className="field" />
        {/* Honest rather than quietly dead: this field drove a font-family on
            <body> that named a family the site never loaded, so body text
            resolved to it and fell back. That override is gone; the heading
            and body faces are roles now, set in Site style. */}
        <span className="text-xs text-amber-700">
          No longer applied to the storefront — set the typeface in Site style.
        </span>
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Currency
          <input
            name="defaultCurrency"
            required
            defaultValue={settings.defaultCurrency}
            className="field uppercase"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Locale
          <input
            name="defaultLocale"
            required
            defaultValue={settings.defaultLocale}
            className="field"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Contact email
        <input
          name="contactEmail"
          type="email"
          required
          defaultValue={settings.contactEmail}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        VAT / P.IVA number
        <input name="vatNumber" defaultValue={settings.vatNumber ?? ""} className="field" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Company legal name
        <input
          name="companyLegalName"
          defaultValue={settings.companyLegalName ?? ""}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Company address
        <textarea
          name="companyAddress"
          rows={2}
          defaultValue={settings.companyAddress ?? ""}
          className="field"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Free shipping threshold (leave blank to disable)
        <input
          name="freeShippingThreshold"
          type="number"
          min={0}
          step="0.01"
          defaultValue={
            settings.freeShippingThreshold !== null
              ? settings.freeShippingThreshold / 100
              : undefined
          }
          className="field"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="pricesIncludeTax"
          defaultChecked={settings.pricesIncludeTax}
          className="field-checkbox"
        />
        Displayed prices include VAT/IVA
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Trust badge (shown on every product page, near the price)
        <input
          name="trustBadgeText"
          placeholder="e.g. 100% authentic, handmade in Murano"
          maxLength={200}
          defaultValue={settings.trustBadgeText ?? ""}
          className="field"
        />
        <span className="text-foreground/60 text-xs">
          Leave blank to hide it. Free text so it stays true if what you sell changes.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="showTestimonials"
          defaultChecked={settings.showTestimonials}
          className="field-checkbox"
        />
        Show &quot;What customers say&quot; on the homepage
      </label>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Personalised gift card</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="giftCardEnabled"
            defaultChecked={settings.giftCardEnabled}
            className="field-checkbox"
          />
          Offer the personalised gift card
        </label>
        <span className="text-foreground/60 text-xs">
          When on: the /personalised-gift-card page, the &quot;Make it a gift&quot; block on
          product pages, the cart invitation and the home page banner. Each card&apos;s text,
          names and font appear on the order to print. When off, all of it disappears and
          checkout ignores any card.
        </span>
        <label className="flex flex-col gap-1 text-sm">
          Price (€)
          <input
            name="giftCardPrice"
            type="number"
            min="0"
            max="1000"
            step="0.01"
            defaultValue={(settings.giftCardPrice / 100).toFixed(2)}
            className="field max-w-40"
          />
        </label>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">SEO</legend>
        <label className="flex flex-col gap-1 text-sm">
          Site URL
          <input
            name="siteUrl"
            type="url"
            placeholder="https://shop.example.com"
            defaultValue={settings.siteUrl ?? ""}
            className="field"
          />
          <span className="text-foreground/60 text-xs">
            Your live domain. Required for the sitemap, robots.txt, canonical links, and social
            share images to point at the right place once deployed.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Meta description
          <textarea
            name="metaDescription"
            rows={2}
            maxLength={300}
            placeholder={`Shop at ${settings.storeName}`}
            defaultValue={settings.metaDescription ?? ""}
            className="field"
          />
          <span className="text-foreground/60 text-xs">
            Shown under your title in Google search results. Aim for 120–160 characters.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Social share image (Open Graph)
          <input
            name="ogImageUrl"
            type="url"
            placeholder="https://.../share-image.jpg"
            defaultValue={settings.ogImageUrl ?? ""}
            className="field"
          />
          <span className="text-foreground/60 text-xs">
            Shown when a link to your store is shared on social media or chat apps. 1200×630px
            recommended. Falls back to your logo if left blank.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Google Search Console verification code
          <input
            name="googleSiteVerification"
            placeholder="the value after content= in Search Console's HTML tag option"
            defaultValue={settings.googleSiteVerification ?? ""}
            className="field"
          />
          <span className="text-foreground/60 text-xs">
            Proves domain ownership to Google so you can submit the sitemap and monitor indexing —
            paste just the code, not the full &lt;meta&gt; tag.
          </span>
        </label>
      </fieldset>

      <fieldset className="border-foreground/10 bg-background/50 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Social links (optional)</legend>
        {(
          [
            ["facebookUrl", "Facebook"],
            ["instagramUrl", "Instagram"],
            ["twitterUrl", "X / Twitter"],
            ["tiktokUrl", "TikTok"],
            ["youtubeUrl", "YouTube"],
            ["linkedinUrl", "LinkedIn"],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              name={name}
              type="url"
              placeholder="https://"
              defaultValue={settings[name] ?? ""}
              className="field"
            />
          </label>
        ))}
      </fieldset>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}
      {state?.success && <FormAlert type="success">Settings saved.</FormAlert>}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-fit text-sm">
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
