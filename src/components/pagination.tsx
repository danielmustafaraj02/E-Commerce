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
    <nav aria-label="Pagination" className="mt-10 flex w-full flex-wrap items-center justify-center gap-2 text-sm">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={isCurrent ? "page" : undefined}
            className={
              isCurrent
                ? "bg-primary flex h-9 min-w-9 items-center justify-center rounded-md px-3 font-semibold text-white shadow-sm"
                : "border-foreground/15 flex h-9 min-w-9 items-center justify-center rounded-md border px-3 font-medium transition-all duration-150 hover:-translate-y-0.5 hover:border-[#f5c451] hover:text-[#f5c451] hover:shadow-[0_6px_14px_-8px_#f5c451]"
            }
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
