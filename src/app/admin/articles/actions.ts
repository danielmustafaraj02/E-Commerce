"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { ARTICLES } from "@/lib/journal";
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
  let rawItBody: unknown;
  try {
    rawSources = JSON.parse(String(formData.get("sources") ?? "[]"));
    rawItBody = JSON.parse(String(formData.get("itBody") ?? "[]"));
  } catch {
    return { error: "The form could not be read. Reload and try again." } as const;
  }
  const sources = sourcesSchema.safeParse(rawSources);
  if (!sources.success) {
    return { error: sources.error.issues[0]?.message ?? "Check the sources." } as const;
  }

  // Italian version: all-empty means "no translation"; otherwise it must be
  // complete enough to publish (title, description, intro).
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const itDraft = {
    title: text("itTitle"),
    seoTitle: text("itSeoTitle") || undefined,
    description: text("itDescription"),
    intro: text("itIntro"),
    heroAlt: text("itHeroAlt") || undefined,
    body: rawItBody,
  };
  const itEmpty =
    !itDraft.title &&
    !itDraft.description &&
    !itDraft.intro &&
    Array.isArray(rawItBody) &&
    rawItBody.length === 0;
  let translationIt: z.infer<typeof translationItSchema> | null = null;
  if (!itEmpty) {
    const it = translationItSchema.safeParse(itDraft);
    if (!it.success) {
      return {
        error: `Italian version: ${it.error.issues[0]?.message ?? "check the fields"}. Fill the title, description and introduction, or clear the Italian tab.`,
      } as const;
    }
    translationIt = it.data;
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (slug.length < 3) return { error: "The address (slug) is too short." } as const;
  if (ARTICLES.some((a) => a.slug === slug)) {
    return { error: "That address is used by a built-in article. Choose another." } as const;
  }

  const productIds = [...new Set(formData.getAll("productIds").map(String))].slice(0, 20);
  return {
    data: {
      ...parsed.data,
      slug,
      body: body.data,
      sources: sources.data,
      translationIt,
      productIds,
    },
  } as const;
}

function revalidate(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/articles");
}

export async function createArticle(
  _prev: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await requireStaff();
  const result = parseForm(formData);
  if ("error" in result) return { error: result.error };
  const { productIds, translationIt, ...data } = result.data;

  let post;
  try {
    post = await db.journalPost.create({
      data: {
        ...data,
        translationIt: translationIt ?? Prisma.DbNull,
        seoTitle: data.seoTitle ?? null,
        publishedAt: data.published ? new Date() : null,
        products: { connect: productIds.map((id) => ({ id })) },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That address (slug) is already used by another article." };
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "article.create",
    entityType: "JournalPost",
    entityId: post.id,
    after: { slug: post.slug, published: post.published },
  });
  revalidate(post.slug);
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
  const { productIds, translationIt, ...data } = result.data;

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
        publishedAt: data.published ? (before.publishedAt ?? new Date()) : before.publishedAt,
        products: { set: productIds.map((pid) => ({ id: pid })) },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That address (slug) is already used by another article." };
    }
    throw error;
  }

  await writeAuditLog({
    userId: session!.user.id,
    action: "article.update",
    entityType: "JournalPost",
    entityId: id,
    after: { slug: post.slug, published: post.published },
  });
  revalidate(before.slug);
  revalidate(post.slug);
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
  revalidate(post.slug);
  redirect("/admin/articles");
}
