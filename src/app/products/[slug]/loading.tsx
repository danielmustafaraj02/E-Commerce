export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <div className="bg-foreground/10 mb-6 h-4 w-24 animate-pulse rounded" />
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="bg-foreground/10 aspect-square w-full animate-pulse rounded-lg" />
        <div className="flex flex-col gap-4">
          <div className="bg-foreground/10 h-7 w-2/3 animate-pulse rounded" />
          <div className="bg-foreground/10 h-6 w-24 animate-pulse rounded" />
          <div className="bg-foreground/10 h-4 w-32 animate-pulse rounded" />
          <div className="bg-foreground/10 mt-4 h-20 w-full animate-pulse rounded" />
          <div className="bg-foreground/10 mt-2 h-11 w-40 animate-pulse rounded" />
        </div>
      </div>
    </main>
  );
}
