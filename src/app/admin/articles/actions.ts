"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/locale-constants";
import { LOCALE_NAMES } from "@/lib/i18n/locale-names";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { ARTICLES } from "@/lib/journal";
import { articleToPostData } from "@/lib/journal/import-builtin";
import {
  JOURNAL_CATEGORIES,
  bodySchema,
  slugify,
  sourcesSchema,
  translationItSchema,
} from "@/lib/journal/db-articles";

export type ArticleState = { error?: string } | undefined;

const heroSrc = z
  .string()
  .trim()
  .min(1, "Add a main photo")
  .max(2000)
  .refine((src) => /^(\/(?!\/)|https:\/\/)/.test(src), "Photo must be a /path or https:// URL");

const schema = z.object({
  title: z.string().trim().min(3, "Add a title").max(150),
  slug: z.string().trim().max(80),
  category: z.enum(JOURNAL_CATEGORIES),
  seoTitle: z.string().trim().max(70).optional(),
  description: z
    .string()
    .trim()
    .min(10, "Add a short description (shown in search results)")
    .max(300),
  intro: z.string().trim().min(10, "Add an introduction").max(2000),
  heroUrl: heroSrc,
  heroAlt: z.string().trim().max(300),
  published: z.boolean(),
  publishedOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

function parseForm(formData: FormData) {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    category: formData.get("category"),
    seoTitle: formData.get("seoTitle") || undefined,
    description: formData.get("description"),
    intro: formData.get("intro"),
    heroUrl: formData.get("heroUrl") ?? "",
    heroAlt: formData.get("heroAlt") ?? "",
    published: formData.get("published") === "on",
    publishedOn: formData.get("publishedOn") || undefined,
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" } as const;

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(String(formData.get("body") ?? "[]"));
  } catch {
    return { error: "The article text could not be read. Reload and try again." } as const;
  }
  const body = bodySchema.safeParse(rawBody);
  if (!body.success) {
    return { error: body.error.issues[0]?.message ?? "Check the article text." } as const;
  }

  let rawSources: unknown;
  let rawTranslations: unknown;
  try {
    rawSources = JSON.parse(String(formData.get("sources") ?? "[]"));
    rawTranslations = JSON.parse(String(formData.get("translations") ?? "{}"));
  } catch {
    return { error: "The form could not be read. Reload and try again." } as const;
  }
  const sources = sourcesSchema.safeParse(rawSources);
  if (!sources.success) {
    return { error: sources.error.issues[0]?.message ?? "Check the sources." } as const;
  }

  // Other languages: an all-empty language means "no translation"; otherwise
  // it must be complete enough to publish (title, description, intro).
  const translations: Partial<Record<Locale, z.infer<typeof translationItSchema>>> = {};
  const drafts = (
    rawTranslations && typeof rawTranslations === "object" ? rawTranslations : {}
  ) as Record<string, Record<string, unknown> | undefined>;
  for (const locale of locales) {
    if (locale === "en") continue;
    const draft = drafts[locale];
    if (!draft) continue;
    const str = (key: string) =>
      typeof draft[key] === "string" ? (draft[key] as string).trim() : "";
    const body = Array.isArray(draft.body) ? draft.body : [];
    if (!str("title") && !str("description") && !str("intro") && body.length === 0) continue;
    const parsed = translationItSchema.safeParse({
      title: str("title"),
      seoTitle: str("seoTitle") || undefined,
      description: str("description"),
      intro: str("intro"),
      heroAlt: str("heroAlt") || undefined,
      body,
    });
    if (!parsed.success) {
      return {
        error: `${LOCALE_NAMES[locale]}: ${parsed.error.issues[0]?.message ?? "check the fields"}. Fill the title, description and introduction, or clear that language.`,
      } as const;
    }
    translations[locale] = parsed.data;
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (slug.length < 3) return { error: "The address (slug) is too short." } as const;

  const productIds = [...new Set(formData.getAll("productIds").map(String))].slice(0, 20);
  return {
    data: {
      ...parsed.data,
      slug,
      body: body.data,
      sources: sources.data,
      translations,
      productIds,
    },
  } as const;
}

// The date shown on the article: the one typed in the form, else the date it
// was first published, else now.
function publishDate(on: string | undefined, existing?: Date | null) {
  if (on) return new Date(`${on}T12:00:00Z`);
  return existing ?? new Date();
}

// Languages other than English and Italian live in their own table. Returns
// an error message, or null.
async function saveTranslations(
  postId: string,
  translations: Partial<Record<Locale, z.infer<typeof translationItSchema>>>
) {
  const others = Object.entries(translations).filter(([locale]) => locale !== "it");
  try {
    await db.journalPostTranslation.deleteMany({
      where: { postId, locale: { notIn: others.map(([locale]) => locale) } },
    });
    for (const [locale, copy] of others) {
      const data = {
        title: copy.title,
        seoTitle: copy.seoTitle ?? null,
        description: copy.description,
        intro: copy.intro,
        heroAlt: copy.heroAlt ?? null,
        body: copy.body,
      };
      await db.journalPostTranslation.upsert({
        where: { postId_locale: { postId, locale } },
        create: { postId, locale, ...data },
        update: data,
      });
    }
  } catch (error) {
    console.error("Journal translations not saved", error);
    if (others.length > 0) {
      return "The article was saved, but its other languages could not be (the database needs its latest migration).";
    }
  }
  return null;
}

function revalidate() {
  revalidatePath("/[locale]/blog", "page");
  // Every article page in every language.
  revalidatePath("/[locale]/blog/[slug]", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/products/[slug]", "page");
  revalidatePath("/admin/articles");
}

export async function createArticle(
  _prev: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await requireStaff();
  const result = parseForm(formData);
  if ("error" in result) return { error: result.error };
  // publishedOn only feeds publishedAt below; it is not a column.
  const { productIds, translations, publishedOn, ...data } = result.data;
  const translationIt = translations.it ?? null;

  let post;
  try {
    post = await db.journalPost.create({
      data: {
        ...data,
        translationIt: translationIt ?? Prisma.DbNull,
        seoTitle: data.seoTitle ?? null,
        publishedAt: data.published ? publishDate(publishedOn) : null,
        products: { connect: productIds.map((id) => ({ id })) },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That address (slug) is already used by another article." };
    }
    throw error;
  }

  const saved = await saveTranslations(post.id, translations);
  if (saved) return { error: saved };

  await writeAuditLog({
    userId: session!.user.id,
    action: "article.create",
    entityType: "JournalPost",
    entityId: post.id,
    after: { slug: post.slug, published: post.published },
  });
  revalidate();
  redirect("/admin/articles");
}

export async function updateArticle(
  id: string,
  _prev: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await requireStaff();
  const result = parseForm(formData);
  if ("error" in result) return { error: result.error };
  // publishedOn only feeds publishedAt below; it is not a column.
  const { productIds, translations, publishedOn, ...data } = result.data;
  const translationIt = translations.it ?? null;

  const before = await db.journalPost.findUnique({
    where: { id },
    select: { slug: true, publishedAt: true },
  });
  if (!before) return { error: "Article not found." };

  let post;
  try {
    post = await db.journalPost.update({
      where: { id },
      data: {
        ...data,
        translationIt: translationIt ?? Prisma.DbNull,
        seoTitle: data.seoTitle ?? null,
        // Keep the original date once it has been published.
        publishedAt: data.published
          ? publishDate(publishedOn, before.publishedAt)
          : before.publishedAt,
        products: { set: productIds.map((pid) => ({ id: pid })) },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That address (slug) is already used by another article." };
    }
    throw error;
  }

  const saved = await saveTranslations(id, translations);
  if (saved) return { error: saved };

  await writeAuditLog({
    userId: session!.user.id,
    action: "article.update",
    entityType: "JournalPost",
    entityId: id,
    after: { slug: post.slug, published: post.published },
  });
  revalidate();
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  const session = await requireStaff();
  const post = await db.journalPost.findUnique({ where: { id }, select: { slug: true } });
  if (!post) redirect("/admin/articles");
  await db.journalPost.delete({ where: { id } });
  await writeAuditLog({
    userId: session!.user.id,
    action: "article.delete",
    entityType: "JournalPost",
    entityId: id,
    before: { slug: post.slug },
  });
  revalidate();
  redirect("/admin/articles");
}

// Link / unlink an existing article from a product's edit page.
export async function setProductArticle(
  productId: string,
  action: "link" | "unlink",
  formData: FormData
) {
  const session = await requireStaff();
  const articleId = String(formData.get("articleId") ?? "");
  if (!articleId) return;
  const [post, product] = await Promise.all([
    db.journalPost.findUnique({ where: { id: articleId }, select: { slug: true } }),
    db.product.findUnique({ where: { id: productId }, select: { id: true } }),
  ]);
  if (!post || !product) return;
  const link = { id: productId };
  await db.journalPost.update({
    where: { id: articleId },
    data: { products: action === "link" ? { connect: link } : { disconnect: link } },
  });
  await writeAuditLog({
    userId: session!.user.id,
    action: `article.${action}Product`,
    entityType: "JournalPost",
    entityId: articleId,
    after: { productId },
  });
  revalidate();
  revalidatePath(`/admin/products/${productId}/edit`);
}

// "Edit" on a built-in article: copy it into the editor as an unpublished
// draft (once), then open that draft. It replaces the built-in version on the
// site only when published.
export async function editBuiltInArticle(slug: string) {
  const session = await requireStaff();
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) redirect("/admin/articles");
  let post = await db.journalPost.findUnique({ where: { slug }, select: { id: true } });
  if (!post) {
    const slugs = [
      article.hero,
      ...article.body.flatMap((b) => (b.type === "image" ? [b.image] : [])),
    ].flatMap((image) => (image.kind === "product" ? [image.productSlug] : []));
    const products = await db.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
      },
    });
    const data = articleToPostData(
      article,
      new Map(products.flatMap((p) => (p.images[0] ? [[p.slug, p.images[0].url] as const] : [])))
    );
    const { translationIt, seoTitle, ...rest } = data;
    post = await db.journalPost.create({
      data: {
        ...rest,
        seoTitle,
        translationIt: translationIt ?? Prisma.DbNull,
        published: false,
        publishedAt: data.publishedAt,
      },
      select: { id: true },
    });
    await writeAuditLog({
      userId: session!.user.id,
      action: "article.importBuiltIn",
      entityType: "JournalPost",
      entityId: post.id,
      after: { slug },
    });
    revalidatePath("/admin/articles");
  }
  redirect(`/admin/articles/${post.id}/edit`);
}
