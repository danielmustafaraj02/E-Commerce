"use client";

import { useSyncExternalStore } from "react";
import {
  addToJourney,
  isReturningVisit,
  parseJourney,
  JOURNEY_KEY,
  JOURNEY_RETURN_KEY,
  type JourneyEntry,
} from "@/lib/journey";

// The recently viewed pieces in this browser (lib/journey.ts). Read through
// useSyncExternalStore so the server and the first client render both see an
// empty journey (no hydration mismatch), then the stored one; other tabs
// update it through the "storage" event. Every storage access is guarded:
// private modes and blocked storage just mean an empty journey.

const CHANGE_EVENT = "perla-journey-change";
const EMPTY: JourneyEntry[] = [];

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(JOURNEY_KEY);
  } catch {
    return null;
  }
}

// Parsed once per stored value, so the snapshot keeps its identity between reads.
let cachedRaw: string | null = null;
let cachedEntries: JourneyEntry[] = EMPTY;
function getSnapshot(): JourneyEntry[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseJourney(raw);
  }
  return cachedEntries;
}
const getServerSnapshot = () => EMPTY;

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === JOURNEY_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(entries: JourneyEntry[]) {
  try {
    window.localStorage.setItem(JOURNEY_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked: the journey simply isn't kept.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Decided once per tab session, from the journey as it stood when the visit
// began, so it doesn't change as pieces are viewed during the visit.
function returningVisit(): boolean {
  try {
    const stored = window.sessionStorage.getItem(JOURNEY_RETURN_KEY);
    if (stored !== null) return stored === "1";
    const returning = isReturningVisit(getSnapshot(), Date.now());
    window.sessionStorage.setItem(JOURNEY_RETURN_KEY, returning ? "1" : "0");
    return returning;
  } catch {
    return false;
  }
}

export function recordProductView(entry: Omit<JourneyEntry, "viewedAt">) {
  returningVisit(); // settle "welcome back" before this view refreshes the journey
  write(addToJourney(getSnapshot(), { ...entry, viewedAt: Date.now() }));
}

// Drops pieces that no longer exist or are no longer on sale.
export function forgetProducts(ids: string[]) {
  if (ids.length === 0) return;
  const drop = new Set(ids);
  write(getSnapshot().filter((entry) => !drop.has(entry.id)));
}

const subscribeNever = () => () => {};

export function useRecentlyViewedProducts() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False on the server and while hydrating, like the journey itself.
  const returning = useSyncExternalStore(subscribeNever, returningVisit, () => false);
  return { entries, returning, forget: forgetProducts };
}
