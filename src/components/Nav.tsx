"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveStats from "@/components/LiveStats";

const LINKS = [
  { href: "/", label: "Leaderboard" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold tracking-tight">
            nonstopbid.lol
          </Link>
          <div className="flex gap-4 text-sm">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-white"
                      : "text-neutral-500 transition-colors hover:text-neutral-300"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="hidden sm:block">
          <LiveStats />
        </div>
      </div>
    </nav>
  );
}
