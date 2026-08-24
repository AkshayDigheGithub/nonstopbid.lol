import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MS = 45_000;

async function getCounts() {
  const [online, totalVisitors] = await Promise.all([
    prisma.visitor.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - ONLINE_WINDOW_MS) } },
    }),
    prisma.visitor.count(),
  ]);
  return { online, totalVisitors };
}

export async function POST(req: NextRequest) {
  const { visitorId } = await req.json();

  if (typeof visitorId !== "string" || !visitorId.trim()) {
    return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
  }

  const id = visitorId.trim().slice(0, 64);

  await prisma.visitor.upsert({
    where: { id },
    create: { id },
    update: { lastSeenAt: new Date() },
  });

  return NextResponse.json(await getCounts());
}

export async function GET() {
  return NextResponse.json(await getCounts());
}
