"use client";

import { useActionState, useMemo, useState } from "react";
import { FormAlert } from "@/components/form-alert";
import {
  JOURNAL_CATEGORIES,
  slugify,
  type StoredBlock,
  type StoredSource,
} from "@/lib/journal/article-schema";
import { uploadImage } from "../upload-image";
import type { ArticleState } from "./actions";

type ProductOption = { id: string; name: string; slug: string };

type Initial = {
  title: string;
  slug: string;
  category: string;
  seoTitle: string;
  description: string;
  intro: string;
  heroUrl: string;
  heroAlt: string;
  published: boolean;
  body: StoredBlock[];
  productIds: string[];
  sources: StoredSource[];
  it: {
    title: string;
    seoTitle: string;
    description: string;
    intro: string;
    heroAlt: string;
    body: StoredBlock[];
  };
};

const BLOCK_LABELS: Record<StoredBlock["type"], string> = {
  p: "Paragraph",
  h2: "Heading",
  h3: "Subheading",
  quote: "Quote",
  facts: "Key points",
  image: "Image",
  products: "Product row",
  cta: "Button",
};

function newBlock(type: StoredBlock["type"]): StoredBlock {
  switch (type) {
    case "p":
    case "h2":
    case "h3":
      return { type, text: "" };
    case "quote":
      return { type, text: "" };
    case "facts":
      return { type, title: "At a glance", items: [""] };
    case "image":
      return { type, src: "", alt: "" };
    case "products":
      return { type, title: "Pieces we love", slugs: [] };
    case "cta":
      return { type, text: "", href: "/products" };
  }
}

function swap<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/** An image picker: upload from the computer, or paste a URL. */
function ImageInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="border-foreground/10 h-20 w-28 rounded border bg-neutral-50 object-cover"
          />
        ) : (
          <div className="border-foreground/20 text-foreground/50 flex h-20 w-28 items-center justify-center rounded border border-dashed text-xs">
            No photo
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <label className="border-foreground/15 hover:bg-foreground/5 w-fit cursor-pointer rounded border px-3 py-1.5 text-sm">
            {busy ? "Uploading…" : `Upload ${label}`}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError(null);
                const result = await uploadImage(file);
                if ("url" in result) onChange(result.url);
                else setError(result.error);
                setBusy(false);
              }}
            />
          </label>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="field font-mono text-xs"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function BlockEditor({
  blocks,
  setBlocks,
  products,
}: {
  blocks: StoredBlock[];
  setBlocks: (blocks: StoredBlock[]) => void;
  products: ProductOption[];
}) {
  const setBlock = (i: number, patch: Partial<StoredBlock>) =>
    setBlocks(blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as StoredBlock) : b)));
  return (
    <>
      <ul className="flex flex-col gap-3">
        {blocks.map((block, i) => (
          <li
            key={i}
            className="border-foreground/10 flex flex-col gap-2 rounded-lg border bg-white p-3"
          >
            <div className="flex items-center gap-1">
              <span className="text-foreground/60 text-xs font-semibold tracking-wide uppercase">
                {BLOCK_LABELS[block.type]}
              </span>
              <span className="ml-auto flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label="Move up"
                  onClick={() => setBlocks(swap(blocks, i, i - 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === blocks.length - 1}
                  aria-label="Move down"
                  onClick={() => setBlocks(swap(blocks, i, i + 1))}
                  className="border-foreground/15 h-7 w-7 rounded border text-xs disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Remove block"
                  onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}
                  className="h-7 rounded border border-red-200 px-2 text-xs text-red-700"
                >
                  Remove
                </button>
              </span>
            </div>

            {(block.type === "p" || block.type === "quote") && (
              <textarea
                rows={block.type === "p" ? 5 : 3}
                value={block.text}
                onChange={(e) => setBlock(i, { text: e.target.value })}
                placeholder={
                  block.type === "p" ? "Text. Link with [label](/products/slug)." : "The quote"
                }
                className="field"
              />
            )}
            {block.type === "quote" && (
              <input
                value={block.cite ?? ""}
                onChange={(e) => setBlock(i, { cite: e.target.value })}
                placeholder="Who said it (optional)"
                className="field"
              />
            )}
            {(block.type === "h2" || block.type === "h3") && (
              <input
                value={block.text}
                onChange={(e) => setBlock(i, { text: e.target.value })}
                className="field"
              />
            )}
            {block.type === "facts" && (
              <>
                <input
                  value={block.title}
                  onChange={(e) => setBlock(i, { title: e.target.value })}
                  className="field"
                  placeholder="Box title"
                />
                <textarea
                  rows={4}
                  value={block.items.join("\n")}
                  onChange={(e) => setBlock(i, { items: e.target.value.split("\n") })}
                  placeholder="One point per line"
                  className="field"
                />
              </>
            )}
            {block.type === "image" && (
              <>
                <ImageInput
                  value={block.src}
                  onChange={(src) => setBlock(i, { src })}
                  label="image"
                />
                <input
                  value={block.alt}
                  onChange={(e) => setBlock(i, { alt: e.target.value })}
                  placeholder="Describe the image (alt text)"
                  className="field"
                />
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => setBlock(i, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className="field"
                />
              </>
            )}
            {block.type === "products" && (
              <>
                <input
                  value={block.title}
                  onChange={(e) => setBlock(i, { title: e.target.value })}
                  className="field"
                  placeholder="Row title"
                />
                <select
                  className="field"
                  value=""
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !block.slugs.includes(e.target.value) &&
                      block.slugs.length < 8
                    )
                      setBlock(i, { slugs: [...block.slugs, e.target.value] });
                  }}
                >
                  <option value="">Add a product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ul className="flex flex-wrap gap-1.5">
                  {block.slugs.map((s) => (
                    <li
                      key={s}
                      className="bg-foreground/5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    >
                      {products.find((p) => p.slug === s)?.name ?? s}
                      <button
                        type="button"
                        aria-label={`Remove ${s}`}
                        onClick={() => setBlock(i, { slugs: block.slugs.filter((x) => x !== s) })}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {block.type === "cta" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={block.text}
                  onChange={(e) => setBlock(i, { text: e.target.value })}
                  placeholder="Button text"
                  className="field"
                />
                <input
                  value={block.href}
                  onChange={(e) => setBlock(i, { href: e.target.value })}
                  placeholder="/products or https://…"
                  className="field font-mono text-xs"
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as StoredBlock["type"][]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setBlocks([...blocks, newBlock(type)])}
            className="border-foreground/15 hover:bg-foreground/5 rounded border px-3 py-1.5 text-sm"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </>
  );
}

export function ArticleForm({
  action,
  deleteAction,
  products,
  submitLabel,
  initial,
}: {
  action: (prev: ArticleState, formData: FormData) => Promise<ArticleState>;
  deleteAction?: () => Promise<void>;
  products: ProductOption[];
  submitLabel: string;
  initial?: Initial;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [heroUrl, setHeroUrl] = useState(initial?.heroUrl ?? "");
  const [blocks, setBlocks] = useState<StoredBlock[]>(initial?.body ?? []);
  const [linked, setLinked] = useState<string[]>(initial?.productIds ?? []);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<"en" | "it">("en");
  const [itBlocks, setItBlocks] = useState<StoredBlock[]>(initial?.it.body ?? []);
  const [sources, setSources] = useState<StoredSource[]>(initial?.sources ?? []);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !linked.includes(p.id) && (!q || p.name.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [products, linked, search]);
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="body" value={JSON.stringify(blocks)} />
      <input type="hidden" name="heroUrl" value={heroUrl} />
      <input type="hidden" name="itBody" value={JSON.stringify(itBlocks)} />
      <input type="hidden" name="sources" value={JSON.stringify(sources)} />
      {linked.map((id) => (
        <input key={id} type="hidden" name="productIds" value={id} />
      ))}

      <div
        role="tablist"
        aria-label="Language"
        className="border-foreground/10 -mb-2 flex gap-1 border-b"
      >
        {(["en", "it"] as const).map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={lang === l}
            onClick={() => setLang(l)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
              lang === l
                ? "border-accent text-accent-deep font-medium"
                : "text-foreground/70 border-transparent"
            }`}
          >
            {l === "en" ? "English" : "Italiano"}
          </button>
        ))}
      </div>

      <div hidden={lang !== "en"} className="flex flex-col gap-6">
        <fieldset className="border-foreground/10 flex flex-col gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Basics</legend>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Title</span>
            <input
              name="title"
              required
              maxLength={150}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="field"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Web address</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="field font-mono text-xs"
              />
              <span className="text-foreground/60 text-xs">/blog/{slug || "…"}</span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Category</span>
              <select
                name="category"
                defaultValue={initial?.category ?? "history"}
                className="field capitalize"
              >
                {JOURNAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Short description</span>
            <textarea
              name="description"
              rows={2}
              maxLength={300}
              required
              defaultValue={initial?.description}
              className="field"
            />
            <span className="text-foreground/60 text-xs">
              Shown on the journal cards and in Google results.
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Search title (optional)</span>
            <input
              name="seoTitle"
              maxLength={70}
              defaultValue={initial?.seoTitle}
              className="field"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Main photo</span>
            <ImageInput value={heroUrl} onChange={setHeroUrl} label="main photo" />
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Photo description (alt text)</span>
            <input
              name="heroAlt"
              maxLength={300}
              defaultValue={initial?.heroAlt}
              className="field"
            />
          </label>
        </fieldset>

        <fieldset className="border-foreground/10 flex flex-col gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Article</legend>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Introduction</span>
            <textarea
              name="intro"
              rows={3}
              maxLength={2000}
              required
              defaultValue={initial?.intro}
              className="field"
            />
          </label>

          <BlockEditor blocks={blocks} setBlocks={setBlocks} products={products} />
        </fieldset>
      </div>

      <div hidden={lang !== "it"} className="flex flex-col gap-6">
        <p className="text-foreground/60 text-sm">
          Optional. Fill in the title, description and introduction to publish an Italian version
          (shown at /it/blog). Leave everything empty for English only. The main photo, linked
          products and sources are shared.
        </p>
        <fieldset className="border-foreground/10 flex flex-col gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Italiano</legend>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Titolo</span>
            <input
              name="itTitle"
              maxLength={150}
              defaultValue={initial?.it.title}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Descrizione breve</span>
            <textarea
              name="itDescription"
              rows={2}
              maxLength={300}
              defaultValue={initial?.it.description}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Titolo per i motori di ricerca (facoltativo)</span>
            <input
              name="itSeoTitle"
              maxLength={70}
              defaultValue={initial?.it.seoTitle}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Descrizione della foto principale (alt)</span>
            <input
              name="itHeroAlt"
              maxLength={300}
              defaultValue={initial?.it.heroAlt}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Introduzione</span>
            <textarea
              name="itIntro"
              rows={3}
              maxLength={2000}
              defaultValue={initial?.it.intro}
              className="field"
            />
          </label>
          <BlockEditor blocks={itBlocks} setBlocks={setItBlocks} products={products} />
        </fieldset>
      </div>

      <fieldset className="border-foreground/10 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Linked products</legend>
        <p className="text-foreground/60 text-xs">
          Linked pieces appear at the end of the article, and the article appears on each
          product&apos;s page.
        </p>
        {linked.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {linked.map((id) => (
              <li
                key={id}
                className="bg-accent/10 text-accent-deep flex items-center gap-1 rounded-full px-3 py-1 text-sm"
              >
                {productById.get(id)?.name ?? id}
                <button
                  type="button"
                  aria-label="Unlink"
                  onClick={() => setLinked(linked.filter((x) => x !== id))}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products to link…"
          className="field"
        />
        {matches.length > 0 && (
          <ul className="border-foreground/10 divide-foreground/10 divide-y rounded border bg-white">
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLinked([...linked, p.id]);
                    setSearch("");
                  }}
                  className="hover:bg-foreground/5 w-full px-3 py-2 text-left text-sm"
                >
                  + {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="border-foreground/10 flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Sources</legend>
        <p className="text-foreground/60 text-xs">
          Optional. Cite the references the article relies on; they are listed at the bottom of the
          article and in its structured data.
        </p>
        <ul className="flex flex-col gap-3">
          {sources.map((source, i) => {
            const set = (patch: Partial<StoredSource>) =>
              setSources(sources.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <li
                key={i}
                className="border-foreground/10 flex flex-col gap-2 rounded-lg border bg-white p-3"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={source.title}
                    onChange={(e) => set({ title: e.target.value })}
                    placeholder="Title of the source"
                    className="field"
                  />
                  <input
                    value={source.publisher}
                    onChange={(e) => set({ publisher: e.target.value })}
                    placeholder="Publisher / author"
                    className="field"
                  />
                  <input
                    value={source.url}
                    onChange={(e) => set({ url: e.target.value })}
                    placeholder="https://…"
                    className="field font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={source.accessed}
                      onChange={(e) => set({ accessed: e.target.value })}
                      aria-label="Date accessed"
                      className="field flex-1"
                    />
                    <select
                      value={source.kind ?? ""}
                      onChange={(e) =>
                        set({ kind: (e.target.value || undefined) as StoredSource["kind"] })
                      }
                      aria-label="Type"
                      className="field flex-1"
                    >
                      <option value="">Type…</option>
                      <option value="primary">Primary</option>
                      <option value="scholarly">Scholarly</option>
                      <option value="institutional">Institutional</option>
                      <option value="reference">Reference</option>
                    </select>
                  </div>
                </div>
                <input
                  value={source.usedFor}
                  onChange={(e) => set({ usedFor: e.target.value })}
                  placeholder="What the article uses it for (English)"
                  className="field"
                />
                <input
                  value={source.usedForIt ?? ""}
                  onChange={(e) => set({ usedForIt: e.target.value })}
                  placeholder="…and in Italian (optional)"
                  className="field"
                />
                <button
                  type="button"
                  onClick={() => setSources(sources.filter((_, j) => j !== i))}
                  className="w-fit text-xs text-red-700 underline"
                >
                  Remove source
                </button>
              </li>
            );
          })}
        </ul>
        {sources.length < 30 && (
          <button
            type="button"
            onClick={() =>
              setSources([
                ...sources,
                {
                  title: "",
                  publisher: "",
                  url: "",
                  usedFor: "",
                  accessed: new Date().toISOString().slice(0, 10),
                },
              ])
            }
            className="border-foreground/15 hover:bg-foreground/5 w-fit rounded border px-3 py-1.5 text-sm"
          >
            + Add source
          </button>
        )}
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={initial?.published ?? false}
          className="field-checkbox"
        />
        Published (visible in the journal and on linked product pages)
      </label>

      {state?.error && <FormAlert type="error">{state.error}</FormAlert>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary w-fit text-sm">
          {pending ? "Saving..." : submitLabel}
        </button>
        {deleteAction && (
          <button
            type="submit"
            formAction={deleteAction}
            formNoValidate
            onClick={(e) => {
              if (!confirm("Delete this article for good?")) e.preventDefault();
            }}
            className="ml-auto text-sm text-red-700 underline"
          >
            Delete article
          </button>
        )}
      </div>
    </form>
  );
}
