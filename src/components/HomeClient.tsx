"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BidForm from "@/components/BidForm";
import Leaderboard, { LeaderboardHandle } from "@/components/Leaderboard";
import LiveStats from "@/components/LiveStats";

export default function HomeClient() {
  const leaderboardRef = useRef<LeaderboardHandle>(null);
  const searchParams = useSearchParams();
  const timeframe = searchParams.get("tf") === "today" ? "today" : "all";
  const category = searchParams.get("category") ?? undefined;

  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          nonstopbid.lol
        </h1>
        <p className="text-neutral-400">
          Pay to claim a rank. Lose it to a higher bid, drop down the board.
        </p>
        <div className="sm:hidden">
          <LiveStats />
        </div>
      </header>

      <BidForm onSuccess={() => leaderboardRef.current?.refresh()} />

      <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-xl font-semibold">Leaderboard</h2>
              <div className="flex gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1 text-sm">
                <Link
                  href={category ? `/?category=${category}` : "/"}
                  className={
                    timeframe === "all"
                      ? "rounded-md bg-neutral-700 px-3 py-1 text-white"
                      : "rounded-md px-3 py-1 text-neutral-400 transition-colors hover:text-neutral-200"
                  }
                >
                  All-time
                </Link>
                <Link
                  href={
                    category
                      ? `/?category=${category}&tf=today`
                      : "/?tf=today"
                  }
                  className={
                    timeframe === "today"
                      ? "rounded-md bg-neutral-700 px-3 py-1 text-white"
                      : "rounded-md px-3 py-1 text-neutral-400 transition-colors hover:text-neutral-200"
                  }
                >
                  Today
                </Link>
              </div>
              {category && (
                <span className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-sm text-neutral-400">
                  in {category}
                  <Link
                    href={timeframe === "today" ? "/?tf=today" : "/"}
                    className="text-neutral-500 hover:text-neutral-300"
                  >
                    ✕
                  </Link>
                </span>
              )}
            </div>
            <button
              onClick={() => leaderboardRef.current?.refresh()}
              className="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
            >
              Refresh
            </button>
          </div>
          <Leaderboard
            ref={leaderboardRef}
            timeframe={timeframe}
            category={category}
          />
      </section>
    </>
  );
}
