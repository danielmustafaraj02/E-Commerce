export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-16 sm:flex-row">
      <aside className="w-full shrink-0 sm:w-64">
        <div className="border-foreground/10 bg-surface flex flex-col gap-5 rounded-lg border p-5">
          <div className="bg-foreground/10 h-4 w-24 animate-pulse rounded" />
          <div className="bg-foreground/10 h-9 w-full animate-pulse rounded" />
          <div className="bg-foreground/10 h-9 w-full animate-pulse rounded" />
          <div className="bg-foreground/10 h-9 w-full animate-pulse rounded" />
        </div>
      </aside>
      <section className="flex-1">
        <div className="bg-foreground/10 mb-4 h-7 w-48 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="bg-foreground/10 aspect-square w-full animate-pulse rounded-lg" />
              <div className="bg-foreground/10 h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-foreground/10 h-4 w-1/3 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
