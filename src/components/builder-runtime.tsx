"use client";

import { useEffect } from "react";
import { initBuilderRuntime } from "@/lib/builder-runtime";

/** Starts the builder's counters and countdowns. Renders nothing. */
export function BuilderRuntime() {
  useEffect(() => {
    initBuilderRuntime();
  }, []);
  return null;
}
