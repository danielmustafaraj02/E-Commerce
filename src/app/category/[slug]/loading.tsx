export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <div className="bg-foreground/10 mb-6 h-7 w-56 animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="bg-foreground/10 aspect-square w-full animate-pulse rounded-lg" />
            <div className="bg-foreground/10 h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-foreground/10 h-4 w-1/3 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
