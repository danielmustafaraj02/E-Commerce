-- CreateTable
CREATE TABLE "JournalPostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "description" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "heroAlt" TEXT,
    "body" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "JournalPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageMeta" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "ogImageUrl" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalPostTranslation_postId_locale_key" ON "JournalPostTranslation"("postId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "PageMeta_key_locale_key" ON "PageMeta"("key", "locale");

-- AddForeignKey
ALTER TABLE "JournalPostTranslation" ADD CONSTRAINT "JournalPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "JournalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
