export default function Loading() {
  return (
    <div>
      <div className="bg-foreground/10 mb-6 h-7 w-40 animate-pulse rounded" />
      <div className="border-foreground/10 overflow-hidden rounded-lg border">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="border-foreground/10 flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <div className="bg-foreground/10 h-4 w-full max-w-[10rem] animate-pulse rounded" />
            <div className="bg-foreground/10 h-4 w-full max-w-[14rem] animate-pulse rounded" />
            <div className="bg-foreground/10 h-4 w-full max-w-[6rem] animate-pulse rounded" />
            <div className="bg-foreground/10 h-4 w-full max-w-[6rem] animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
