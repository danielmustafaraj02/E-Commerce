import Link from "next/link";

export function Pagination({
  totalPages,
  currentPage,
  buildHref,
  label,
}: {
  totalPages: number;
  currentPage: number;
  buildHref: (page: number) => string;
  label: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="shop-pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={buildHref(page)}
            aria-current={isCurrent ? "page" : undefined}
            className="shop-page"
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
