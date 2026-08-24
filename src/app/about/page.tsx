import { MIN_BID_CENTS } from "@/lib/paypal";

export default function AboutPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">About</h1>
      </header>

      <div className="flex flex-col gap-4 text-neutral-300">
        <p>
          nonstopbid.lol is a pay-to-rank leaderboard. Anyone can pay a
          one-time fee to claim a numbered spot for their site, product, or
          profile.
        </p>
        <p>
          Higher payments claim higher spots. If someone later pays more
          than your listing&apos;s price for that rank, they take it and you
          move down the board.
        </p>
        <p>
          New spots start at ${(MIN_BID_CENTS / 100).toFixed(2)}. Paying
          less than the #1 price still puts you on the board at whatever
          place that bid can take.
        </p>
        <p className="text-sm text-neutral-500">
          All payments are final once a spot is claimed — there are no
          refunds if someone else claims your rank with a higher bid, since
          the listing was live for as long as it held the rank.
        </p>
      </div>
    </>
  );
}
