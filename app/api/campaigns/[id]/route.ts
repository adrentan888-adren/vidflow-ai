import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json() as {
    isActive?: boolean;
    intervalHours?: number;
    name?: string;
    prompt?: string;
    imageUrls?: string[];
    channelUser?: string;
    platform?: string;
  };

  const campaign = await prisma.campaign.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ campaign });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.campaign.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
