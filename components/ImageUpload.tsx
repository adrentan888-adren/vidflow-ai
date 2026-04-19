"use client";
import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { urls?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange([...value, ...(data.urls ?? [])]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-sky-600 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-sky-400 text-sm">Uploading...</p>
        ) : (
          <>
            <p className="text-slate-400 text-sm">Drop images here or click to browse</p>
            <p className="text-slate-600 text-xs mt-1">JPEG, PNG, WEBP — max 10MB each</p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {value.map((url) => (
            <div key={url} className="relative group">
              <Image src={url} alt="" width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-600 text-white text-xs rounded-full hidden group-hover:flex items-center justify-center"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
