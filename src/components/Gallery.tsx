"use client";

import { useEffect, useMemo, useState } from "react";
import type { Wallpaper } from "@/types";
import Viewer from "@/components/Viewer";

const CATEGORY_LIST = [
  "All",
  "Nature",
  "Abstract",
  "Minimal",
  "Dark",
  "Anime",
  "Space",
  "City",
  "Animals",
  "Cars",
  "Art",
  "Gradient",
  "Other",
];

export default function Gallery() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("tag", category);
    if (search.trim()) params.set("q", search.trim());

    const controller = new AbortController();
    fetch(`/api/wallpapers?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setWallpapers(data.wallpapers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, search]);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
      {/* hero */}
      <div className="mb-8 text-center">
        <h1 className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          Full-HD Wallpapers, Free
        </h1>
        <p className="mt-2 text-sm text-gray-400 sm:text-base">
          Browse, zoom in, and download — no sign-up needed.
        </p>
      </div>

      {/* search */}
      <div className="mx-auto mb-4 max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wallpapers..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* categories */}
      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_LIST.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              category === c
                ? "bg-gradient-to-r from-accent to-accent-2 text-white"
                : "border border-border bg-surface text-gray-400 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-surface"
            />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-medium text-gray-300">No wallpapers yet</p>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Head to the Upload page to add the first wallpapers to your gallery.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {wallpapers.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setViewerIndex(i)}
              className="group relative mb-3 block w-full overflow-hidden rounded-xl border border-border bg-surface text-left break-inside-avoid sm:mb-4"
              style={{ aspectRatio: `${w.width} / ${w.height}` }}
            >
              <img
                src={w.gridUrl}
                alt={w.publicId}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {w.tags.slice(0, 1).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {viewerIndex !== null && (
        <Viewer
          wallpapers={wallpapers}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
        />
      )}
    </div>
  );
}
