import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true } },
      posts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string;
    prompt: string;
    imageUrls: string[];
    channelUser: string;
    platform: string;
    intervalHours?: number;
  };

  const { name, prompt, imageUrls, channelUser, platform, intervalHours = 4 } = body;

  if (!name || !prompt || !imageUrls?.length || !channelUser || !platform) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const nextRunAt = new Date();

  const campaign = await prisma.campaign.create({
    data: {
      name,
      prompt,
      imageUrls,
      channelUser,
      platform,
      intervalHours,
      nextRunAt,
      timezone: "Asia/Kuala_Lumpur",
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
