"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { useRouter } from "next/navigation";

interface SocialAccount {
  platform: string;
  displayName: string;
  avatar?: string;
}
interface Profile {
  username: string;
  socialAccounts: SocialAccount[];
}

export default function CampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [intervalHours, setIntervalHours] = useState(4);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<{ username: string; platform: string } | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((d: { profiles?: Profile[] }) => setProfiles(d.profiles ?? []))
      .catch(() => toast.error("Could not load social channels"))
      .finally(() => setLoadingProfiles(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) { toast.error("Select a social media channel"); return; }
    if (!imageUrls.length) { toast.error("Upload at least one image"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt, imageUrls, channelUser: selected.username, platform: selected.platform, intervalHours }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create campaign");
      toast.success("Campaign created! Videos will start posting automatically.");
      router.push("/campaigns");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const platformIcons: Record<string, string> = {
    tiktok: "🎵", instagram: "📸", youtube: "▶️", twitter: "🐦",
    facebook: "👤", linkedin: "💼", threads: "🧵", pinterest: "📌",
    bluesky: "🦋", reddit: "🔴",
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Campaign Name</label>
        <input
          required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Daily TikTok Vibes"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Images <span className="text-slate-500 font-normal">(the AI will rotate through these)</span>
        </label>
        <ImageUpload value={imageUrls} onChange={setImageUrls} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Video Prompt</label>
        <textarea
          required value={prompt} onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Describe the motion/animation you want applied to the image..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Post Interval (hours)</label>
        <input
          type="number" min={1} max={168} value={intervalHours}
          onChange={(e) => setIntervalHours(parseInt(e.target.value))}
          className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <p className="text-slate-500 text-xs mt-1">Default: every 4 hours (Asia/Kuala Lumpur)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Post To</label>
        {loadingProfiles ? (
          <p className="text-slate-500 text-sm">Loading connected channels...</p>
        ) : profiles.length === 0 ? (
          <p className="text-slate-500 text-sm">No connected accounts found. Connect accounts in your Upload-Post dashboard first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profiles.flatMap((p) =>
              p.socialAccounts.map((acc) => {
                const key = `${p.username}::${acc.platform}`;
                const isSelected = selected?.username === p.username && selected?.platform === acc.platform;
                return (
                  <button
                    key={key} type="button"
                    onClick={() => setSelected({ username: p.username, platform: acc.platform })}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                      isSelected
                        ? "border-sky-500 bg-sky-900/30 text-sky-300"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-lg">{platformIcons[acc.platform] ?? "📱"}</span>
                    <div>
                      <p className="font-medium">{acc.displayName}</p>
                      <p className="text-xs text-slate-500 capitalize">{acc.platform}</p>
                    </div>
                    {isSelected && <span className="ml-auto text-sky-400">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <button
        type="submit" disabled={saving}
        className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
      >
        {saving ? "Creating..." : "Create Campaign"}
      </button>
    </form>
  );
}
