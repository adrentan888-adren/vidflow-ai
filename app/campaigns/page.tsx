export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import Link from "next/link";
import CampaignForm from "@/components/CampaignForm";
import CampaignList from "@/components/CampaignList";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true } },
      posts: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, createdAt: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Campaigns</h1>
      <p className="text-slate-400 text-sm mb-8">Each campaign auto-generates and posts a video on your set interval</p>

      {campaigns.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Active Campaigns</h2>
          <CampaignList initialCampaigns={campaigns} />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">
        {campaigns.length === 0 ? "Create Your First Campaign" : "New Campaign"}
      </h2>
      <CampaignForm />
    </div>
  );
}
