"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/campaigns", label: "Campaigns", icon: "🎬" },
  { href: "/history", label: "Post History", icon: "📋" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col py-6 px-4 shrink-0">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-sky-400">VidFlow AI</span>
        <p className="text-xs text-slate-500 mt-0.5">Auto video poster</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              path === l.href
                ? "bg-sky-900/50 text-sky-300 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
