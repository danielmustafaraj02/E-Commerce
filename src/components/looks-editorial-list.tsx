import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale-constants";
import { lookRowLabels } from "@/lib/i18n/look-page-copy";
import type { LookView } from "@/lib/look-data";
import { optionAttributes } from "@/lib/section-style";
import { EditorialReveal } from "@/components/editorial-reveal";
import { Link } from "@/components/localized-link";
import { LookRow } from "@/components/look-editorial";

/**
 * The looks as editorial rows, in the template chosen in Admin > Page layout >
 * Looks (`options`, the Looks list's stored options), followed by the link to
 * every look. Used by the home page's looks section and the page builder's
 * live "looks" block.
 *
 * One controller for the whole list arms the scroll-in sequence: the rows
 * arrive in order, then hold still.
 */
export function LooksEditorialList({
  looks,
  options,
  dict,
  locale,
  catalogLocale,
}: {
  looks: LookView[];
  options: Record<string, string>;
  dict: Dictionary;
  /** The visitor's language. */
  locale: Locale;
  /** The store's default language, which formats the prices. */
  catalogLocale: string;
}) {
  return (
    <>
      <div className="looks-editorial-list" data-editorial-root {...optionAttributes(options)}>
        <EditorialReveal>
          {looks.map((look, index) => (
            <LookRow
              style={options.lookStyle}
              index={index}
              key={look.id}
              look={look}
              locale={catalogLocale}
              labels={lookRowLabels(look.name, dict, locale)}
            />
          ))}
        </EditorialReveal>
      </div>
      <p className="shelf-looks-more">
        <Link href="/looks" className="shelf-link">
          {dict.looks.allLooks} <span aria-hidden="true">→</span>
        </Link>
      </p>
    </>
  );
}
