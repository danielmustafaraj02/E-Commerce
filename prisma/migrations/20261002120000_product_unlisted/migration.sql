-- Link-only products: reachable at /products/<slug> but excluded from every
-- browse surface (listings, homepage, gift finder, sitemap, feeds).
ALTER TABLE "Product" ADD COLUMN "unlisted" BOOLEAN NOT NULL DEFAULT false;
