// Re-mounts on every navigation (that's what `template.tsx` is for, unlike
// layout.tsx), so the fade-up defined in globals.css replays on each route
// change without wrapping Header/Footer, which stay stable across nav.
export default function RootTemplate({ children }: LayoutProps<"/">) {
  // id/tabIndex make this the skip link's target (see the link in layout.tsx):
  // activating it moves focus here, so the next Tab lands in the page content
  // instead of back in the header.
  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="page-transition flex flex-1 flex-col outline-none"
    >
      {children}
    </div>
  );
}
