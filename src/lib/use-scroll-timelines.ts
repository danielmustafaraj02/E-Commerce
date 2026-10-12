"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the browser has CSS scroll timelines (`animation-timeline: view()`).
 * Where it does, the site's entrances follow the scroll in CSS (globals.css,
 * "Scroll-linked motion"), so the components that used to stage a timed
 * reveal show their content straight away and leave the motion to the
 * stylesheet. False on the server and during hydration, so the first client
 * render matches the HTML.
 */
const query = () => CSS.supports("animation-timeline: view()");
const subscribe = () => () => {};
const onServer = () => false;

export function useScrollTimelines() {
  return useSyncExternalStore(subscribe, query, onServer);
}
