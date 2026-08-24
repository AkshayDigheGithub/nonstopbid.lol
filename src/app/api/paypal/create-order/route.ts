import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPayPalOrder, MIN_BID_CENTS } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, url, description, category, amountDollars } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof url !== "string" ||
    !url.trim() ||
    typeof description !== "string" ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof amountDollars !== "number" ||
    !Number.isFinite(amountDollars)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const amountCents = Math.round(amountDollars * 100);

  if (amountCents < MIN_BID_CENTS) {
    return NextResponse.json(
      { error: `Minimum bid is $${(MIN_BID_CENTS / 100).toFixed(2)}` },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const order = await createPayPalOrder(amountCents);

  await prisma.pendingOrder.create({
    data: {
      id: order.id,
      title: title.trim().slice(0, 120),
      url: parsedUrl.toString(),
      description: description.trim().slice(0, 500),
      category: category.trim().slice(0, 60),
      amountCents,
    },
  });

  return NextResponse.json({ orderId: order.id });
}
