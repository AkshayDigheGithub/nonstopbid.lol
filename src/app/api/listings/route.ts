import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe");
  const category = searchParams.get("category");

  const listings = await prisma.listing.findMany({
    where: {
      ...(timeframe === "today"
        ? { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { amountCents: "desc" },
  });

  return NextResponse.json({ listings });
}
