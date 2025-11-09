"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { MediaAsset } from "@/types/media";

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/media", { cache: "no-store" });
    const data = await response.json();
    setAssets(data.assets ?? []);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      await refresh();
      event.target.value = "";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;
    await fetch(`/api/media?filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Media</p>
          <h2 className="text-2xl font-semibold text-slate-900">Uploads & compression</h2>
          <p className="text-sm text-slate-500">Images are resized to 2000px max width and saved as WebP.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
          {uploading ? "Uploading…" : "+ Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleUpload}
          />
        </label>
      </header>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.filename} className="space-y-3 rounded-2xl border border-slate-100 p-4">
            <Image
              src={asset.url}
              alt={asset.filename}
              width={640}
              height={360}
              className="h-40 w-full rounded-xl object-cover"
            />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">{asset.filename}</p>
              <p className="text-xs text-slate-500">
                {(asset.size / 1024).toFixed(1)} kB · {new Date(asset.modifiedAt).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(asset.url)}
                className="text-xs font-semibold text-blue-600"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => handleDelete(asset.filename)}
                className="text-xs font-semibold text-red-500"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {assets.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
            No uploads yet. Drag in product shots or hero images and reuse the URLs anywhere in the CMS fields.
          </p>
        )}
      </div>
    </section>
  );
}
