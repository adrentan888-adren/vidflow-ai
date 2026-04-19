import { prisma } from "@/lib/db";

export default async function HistoryPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { campaign: { select: { name: true, platform: true } } },
  });

  const statusColor: Record<string, string> = {
    done: "bg-emerald-900/50 text-emerald-300",
    failed: "bg-rose-900/50 text-rose-300",
    generating: "bg-yellow-900/50 text-yellow-300",
    posting: "bg-blue-900/50 text-blue-300",
    pending: "bg-slate-700 text-slate-400",
  };

  const platformIcons: Record<string, string> = {
    tiktok: "🎵", instagram: "📸", youtube: "▶️", twitter: "🐦",
    facebook: "👤", linkedin: "💼", threads: "🧵", pinterest: "📌",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Post History</h1>
      <p className="text-slate-400 text-sm mb-8">All generated and posted videos</p>

      {posts.length === 0 ? (
        <p className="text-slate-500">No posts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                <th className="pb-3 pr-4">Campaign</th>
                <th className="pb-3 pr-4">Platform</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Scheduled</th>
                <th className="pb-3 pr-4">Completed</th>
                <th className="pb-3">Links</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="py-3 pr-4 font-medium">{p.campaign.name}</td>
                  <td className="py-3 pr-4">
                    <span>{platformIcons[p.campaign.platform] ?? "📱"} {p.campaign.platform}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-slate-700 text-slate-400"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {new Date(p.scheduledAt).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                  </td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">
                    {p.completedAt
                      ? new Date(p.completedAt).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })
                      : "—"}
                  </td>
                  <td className="py-3 text-xs flex gap-3">
                    {p.videoUrl && (
                      <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Video ↗</a>
                    )}
                    {p.postUrl && (
                      <a href={p.postUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Post ↗</a>
                    )}
                    {p.error && (
                      <span className="text-rose-400 truncate max-w-xs" title={p.error}>Error: {p.error.slice(0, 40)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
