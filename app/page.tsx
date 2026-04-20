export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";

async function getStats() {
  const [total, done, failed, active] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "done" } }),
    prisma.post.count({ where: { status: "failed" } }),
    prisma.campaign.count({ where: { isActive: true } }),
  ]);
  const recent = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { campaign: { select: { name: true, platform: true } } },
  });
  return { total, done, failed, active, recent };
}

export default async function Dashboard() {
  const { total, done, failed, active, recent } = await getStats();

  const stats = [
    { label: "Active Campaigns", value: active, color: "text-sky-400" },
    { label: "Videos Posted", value: done, color: "text-emerald-400" },
    { label: "Total Runs", value: total, color: "text-violet-400" },
    { label: "Failed", value: failed, color: "text-rose-400" },
  ];

  const statusColor: Record<string, string> = {
    done: "bg-emerald-900/50 text-emerald-300",
    failed: "bg-rose-900/50 text-rose-300",
    generating: "bg-yellow-900/50 text-yellow-300",
    posting: "bg-blue-900/50 text-blue-300",
    pending: "bg-slate-700 text-slate-300",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-slate-400 text-sm mb-8">Automated AI video posting to your social media</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      {recent.length === 0 ? (
        <p className="text-slate-500 text-sm">No posts yet. Create a campaign to get started.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.campaign.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {p.campaign.platform.toUpperCase()} · {new Date(p.createdAt).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {p.postUrl && (
                  <a href={p.postUrl} target="_blank" rel="noopener noreferrer"
                     className="text-sky-400 text-xs hover:underline">View post ↗</a>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-slate-700 text-slate-300"}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
