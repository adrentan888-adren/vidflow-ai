"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";

interface Campaign {
  id: string;
  name: string;
  prompt: string;
  imageUrls: string[];
  channelUser: string;
  platform: string;
  intervalHours: number;
  isActive: boolean;
}

interface SocialAccount {
  platform: string;
  displayName: string;
}

interface Profile {
  username: string;
  socialAccounts: SocialAccount[];
}

interface Props {
  campaign: Campaign;
  onClose: () => void;
  onSaved: (updated: Campaign) => void;
}

const platformIcons: Record<string, string> = {
  tiktok: "🎵", instagram: "📸", youtube: "▶️", twitter: "🐦",
  facebook: "👤", linkedin: "💼", threads: "🧵", pinterest: "📌",
  bluesky: "🦋", reddit: "🔴",
};

export default function EditCampaignModal({ campaign, onClose, onSaved }: Props) {
  const [name, setName] = useState(campaign.name);
  const [prompt, setPrompt] = useState(campaign.prompt);
  const [imageUrls, setImageUrls] = useState<string[]>(campaign.imageUrls);
  const [intervalHours, setIntervalHours] = useState(campaign.intervalHours);
  const [selected, setSelected] = useState<{ username: string; platform: string }>({
    username: campaign.channelUser,
    platform: campaign.platform,
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((d: { profiles?: Profile[] }) => setProfiles(d.profiles ?? []))
      .catch(() => toast.error("Could not load channels"))
      .finally(() => setLoadingProfiles(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrls.length) { toast.error("Upload at least one image"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          prompt,
          imageUrls,
          channelUser: selected.username,
          platform: selected.platform,
          intervalHours,
        }),
      });
      const data = await res.json() as { campaign?: Campaign; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success("Campaign updated");
      onSaved(data.campaign!);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Edit Campaign</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <form onSubmit={save} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Campaign Name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Images</label>
            <ImageUpload value={imageUrls} onChange={setImageUrls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Video Prompt</label>
            <textarea
              required value={prompt} onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Post Interval (hours)</label>
            <input
              type="number" min={1} max={168} value={intervalHours}
              onChange={(e) => setIntervalHours(parseInt(e.target.value))}
              className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Post To</label>
            {loadingProfiles ? (
              <p className="text-slate-500 text-sm">Loading channels...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profiles.flatMap((p) =>
                  p.socialAccounts.map((acc) => {
                    const isSelected = selected.username === p.username && selected.platform === acc.platform;
                    return (
                      <button
                        key={`${p.username}::${acc.platform}`}
                        type="button"
                        onClick={() => setSelected({ username: p.username, platform: acc.platform })}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                          isSelected
                            ? "border-sky-500 bg-sky-900/30 text-sky-300"
                            : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <span>{platformIcons[acc.platform] ?? "📱"}</span>
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

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={saving}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-5 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
