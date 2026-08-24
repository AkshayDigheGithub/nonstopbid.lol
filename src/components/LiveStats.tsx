"use client";

import { useEffect, useState } from "react";

const HEARTBEAT_MS = 20_000;
const VISITOR_ID_KEY = "nonstopbid_visitor_id";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export default function LiveStats() {
  const [online, setOnline] = useState<number | null>(null);
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const visitorId = getVisitorId();

    async function beat() {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setOnline(data.online);
        setTotalVisitors(data.totalVisitors);
      } catch {
        // presence is best-effort; ignore failures
      }
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span>
        {online === null ? "…" : online.toLocaleString()} online
      </span>
      <span className="text-neutral-700">·</span>
      <span>
        {totalVisitors === null ? "…" : totalVisitors.toLocaleString()}{" "}
        visitors since launch
      </span>
    </div>
  );
}
