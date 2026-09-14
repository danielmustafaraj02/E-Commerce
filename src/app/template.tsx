// Re-mounts on every navigation (that's what `template.tsx` is for, unlike
// layout.tsx), so the fade-up defined in globals.css replays on each route
// change without wrapping Header/Footer, which stay stable across nav.
export default function RootTemplate({ children }: LayoutProps<"/">) {
  return <div className="page-transition flex flex-1 flex-col">{children}</div>;
}
