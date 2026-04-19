import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "VidFlow AI — Automated Video Posting",
  description: "Generate and auto-post AI videos to your social media",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" } }}
        />
      </body>
    </html>
  );
}
