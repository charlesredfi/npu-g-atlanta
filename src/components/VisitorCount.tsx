"use client";

import { useEffect, useState } from "react";

export function VisitorCount() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/visits", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as {
          ok?: boolean;
          visitors?: number | null;
        };
        if (
          !cancelled &&
          data.ok &&
          typeof data.visitors === "number" &&
          data.visitors >= 0
        ) {
          setVisitors(data.visitors);
        }
      })
      .catch(() => {
        // Keep footer clean if the counter is offline.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (visitors === null) return null;

  return (
    <p className="mt-2 text-[10px] leading-none tracking-wide text-muted/70">
      Unique visitors: {visitors.toLocaleString("en-US")}
    </p>
  );
}
