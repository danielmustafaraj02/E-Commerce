// Sitewide top bar, shown above the header on every page, so the free
// EU/Italy shipping benefit (the site's strongest conversion/trust signal
// per the shipping messaging pass) is visible before a visitor scrolls.
export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-primary text-background">
      <p className="mx-auto w-full max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide text-balance sm:text-sm">
        {message}
      </p>
    </div>
  );
}
