import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const groups = await prisma.listing.groupBy({
    by: ["category"],
    _count: { _all: true },
    _max: { amountCents: true },
    orderBy: { _count: { category: "desc" } },
  });

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-neutral-400">Browse listings by category.</p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
          No listings yet — categories will show up here once someone claims
          a spot.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((g) => (
            <li key={g.category}>
              <Link
                href={`/?category=${encodeURIComponent(g.category)}`}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-600"
              >
                <span className="font-medium">{g.category}</span>
                <span className="text-sm text-neutral-500">
                  {g._count._all} listing{g._count._all === 1 ? "" : "s"} ·
                  top ${((g._max.amountCents ?? 0) / 100).toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
