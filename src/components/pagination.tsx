import Link from "next/link";

export function Pagination({
  totalPages,
  currentPage,
  buildHref,
}: {
  totalPages: number;
  currentPage: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center gap-1.5 text-sm">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={isCurrent ? "page" : undefined}
            className={
              isCurrent
                ? "bg-primary flex h-9 min-w-9 items-center justify-center rounded-md px-3 font-semibold text-white"
                : "border-foreground/15 text-foreground/70 hover:border-primary hover:text-primary flex h-9 min-w-9 items-center justify-center rounded-md border px-3 transition-colors"
            }
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
