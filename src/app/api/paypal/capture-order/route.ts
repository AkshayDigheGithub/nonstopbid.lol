import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const pending = await prisma.pendingOrder.findUnique({
    where: { id: orderId },
  });

  if (!pending) {
    return NextResponse.json(
      { error: "No pending order found for this id" },
      { status: 404 }
    );
  }

  const capture = await capturePayPalOrder(orderId);

  if (capture.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `Payment not completed (status: ${capture.status})` },
      { status: 402 }
    );
  }

  const capturedUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
  const capturedAmount = capturedUnit?.amount?.value;
  const capturedCents = capturedAmount
    ? Math.round(parseFloat(capturedAmount) * 100)
    : 0;

  if (capturedCents !== pending.amountCents) {
    return NextResponse.json(
      { error: "Captured amount does not match pending order amount" },
      { status: 400 }
    );
  }

  const [listing] = await prisma.$transaction([
    prisma.listing.create({
      data: {
        title: pending.title,
        url: pending.url,
        description: pending.description,
        category: pending.category,
        amountCents: pending.amountCents,
      },
    }),
    prisma.pendingOrder.delete({ where: { id: orderId } }),
  ]);

  return NextResponse.json({ listing });
}
