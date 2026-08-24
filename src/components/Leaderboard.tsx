"use client";

import { useEffect, useImperativeHandle, forwardRef, useState } from "react";

type Listing = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  amountCents: number;
  createdAt: string;
};

export type LeaderboardHandle = {
  refresh: () => void;
};

type Props = {
  timeframe?: "all" | "today";
  category?: string;
};

const RANK_STYLES = [
  {
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500 text-black",
    medal: "🥇",
  },
  {
    border: "border-neutral-400/40",
    bg: "bg-neutral-400/5",
    badge: "bg-neutral-300 text-black",
    medal: "🥈",
  },
  {
    border: "border-orange-700/40",
    bg: "bg-orange-700/5",
    badge: "bg-orange-700 text-white",
    medal: "🥉",
  },
];

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center gap-4">
        <div className="skeleton h-4 w-6 rounded" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>
      </div>
      <div className="skeleton h-4 w-14 rounded" />
    </div>
  );
}

const Leaderboard = forwardRef<LeaderboardHandle, Props>(
  ({ timeframe = "all", category }, ref) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeframe === "today") params.set("timeframe", "today");
      if (category) params.set("category", category);
      const res = await fetch(`/api/listings?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setListings(data.listings ?? []);
      setLoading(false);
    }

    useEffect(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe, category]);

    useImperativeHandle(ref, () => ({ refresh: load }));

    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
          No one has claimed a spot yet. Be the first.
        </div>
      );
    }

    return (
      <ol className="flex flex-col gap-2">
        {listings.map((listing, i) => {
          const style = RANK_STYLES[i];
          return (
            <li
              key={listing.id}
              className={`flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors ${
                style
                  ? `${style.border} ${style.bg} hover:border-opacity-70`
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-600"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex w-8 items-center justify-center rounded-full text-sm font-mono ${
                    style ? style.badge : "text-neutral-500"
                  }`}
                >
                  {style ? style.medal : `#${i + 1}`}
                </span>
                <div>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    {listing.title}
                  </a>
                  <p className="text-sm text-neutral-400">
                    {listing.description}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {listing.category}
                  </p>
                </div>
              </div>
              <span className="font-mono text-green-400">
                ${(listing.amountCents / 100).toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }
);

Leaderboard.displayName = "Leaderboard";

export default Leaderboard;
