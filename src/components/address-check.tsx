"use client";

import { useEffect, useState } from "react";
import { AddressMap } from "@/components/address-map";
import type { GeocodeResult } from "@/lib/geocode";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Answer =
  ({ status: "found" } & GeocodeResult) | { status: "not-found" } | { status: "unavailable" };

const WAIT_AFTER_TYPING_MS = 900;

/**
 * Shows where the typed delivery address is on a map, so a typo (wrong town, wrong
 * street) is caught before the parcel is sent. Purely advisory: whatever it finds,
 * the customer can still place the order. `ready` is false until the fields are
 * complete enough to be worth looking up.
 */
export function AddressCheck({
  street,
  city,
  postalCode,
  country,
  ready,
  dict,
}: {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  ready: boolean;
  dict: Dictionary["checkout"]["addressCheck"];
}) {
  // Kept with the address it answered for, so a stale answer is never shown for
  // an address that has since been edited.
  const [answer, setAnswer] = useState<{ key: string; value: Answer } | null>(null);
  const key = JSON.stringify([street.trim(), city.trim(), postalCode.trim(), country]);

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      let value: Answer;
      try {
        const response = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country,
          }),
          signal: controller.signal,
        });
        value = (await response.json()) as Answer;
      } catch {
        if (controller.signal.aborted) return;
        value = { status: "unavailable" };
      }
      setAnswer({ key, value });
    }, WAIT_AFTER_TYPING_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `key` already captures every field that goes into the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key]);

  if (!ready) return null;

  const current = answer?.key === key ? answer.value : null;

  return (
    <div aria-live="polite" className="flex flex-col gap-2 text-sm">
      {!current && <p className="text-foreground/60">{dict.checking}</p>}
      {current?.status === "found" && (
        <>
          <AddressMap
            lat={current.lat}
            lng={current.lng}
            precision={current.precision}
            alt={dict.mapAlt}
            openLabel={dict.openMap}
          />
          <p className={current.precision === "area" ? "text-warning" : "text-foreground/70"}>
            {current.precision === "area" ? dict.foundArea : dict.found}
          </p>
        </>
      )}
      {current?.status === "not-found" && <p className="text-warning">{dict.notFound}</p>}
      {current?.status === "unavailable" && (
        <p className="text-foreground/60">{dict.unavailable}</p>
      )}
    </div>
  );
}
