"use client";

import dynamic from "next/dynamic";

// The admin live-preview bridge, loaded only when a page renders it (layout
// preview mode). Imported statically, its code (the section builder and the
// layout model) would ship with every page that can be previewed, for every
// visitor.
export const LayoutPreviewBridge = dynamic(
  () => import("./layout-preview-bridge").then((m) => m.LayoutPreviewBridge),
  { ssr: false }
);
