import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const posts = await prisma.post.findMany({
    where: campaignId ? { campaignId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { campaign: { select: { name: true, platform: true } } },
  });

  return NextResponse.json({ posts });
}
