"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  channelUser: string;
  isActive: boolean;
  intervalHours: number;
  nextRunAt: Date | string;
  _count: { posts: number };
  posts: Array<{ status: string; createdAt: Date | string }>;
}

const platformIcons: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", youtube: "▶️", twitter: "🐦",
  facebook: "👤", linkedin: "💼", threads: "🧵", pinterest: "📌",
};

export default function CampaignList({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  async function toggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      setCampaigns((c) => c.map((x) => x.id === id ? { ...x, isActive } : x));
      toast.success(isActive ? "Campaign activated" : "Campaign paused");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this campaign and all its posts?")) return;
    const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCampaigns((c) => c.filter((x) => x.id !== id));
      toast.success("Campaign deleted");
      router.refresh();
    }
  }

  const statusColor: Record<string, string> = {
    done: "text-emerald-400", failed: "text-rose-400",
    generating: "text-yellow-400", posting: "text-blue-400", pending: "text-slate-400",
  };

  return (
    <div className="flex flex-col gap-3">
      {campaigns.map((c) => {
        const lastPost = c.posts[0];
        const nextRun = new Date(c.nextRunAt).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });
        return (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span>{platformIcons[c.platform] ?? "📱"}</span>
                <p className="font-medium">{c.name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.isActive ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                  {c.isActive ? "active" : "paused"}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Every {c.intervalHours}h · @{c.channelUser} · {c._count.posts} posts total
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                Next run: {nextRun}
                {lastPost && (
                  <span className="ml-2">
                    · Last: <span className={statusColor[lastPost.status] ?? "text-slate-400"}>{lastPost.status}</span>
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggle(c.id, !c.isActive)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {c.isActive ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => remove(c.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-rose-900 text-rose-400 hover:bg-rose-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
