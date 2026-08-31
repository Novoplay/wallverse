"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Wallpaper } from "@/types";

interface ViewerProps {
  wallpapers: Wallpaper[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;

export default function Viewer({ wallpapers, index, onClose, onIndexChange }: ViewerProps) {
  const wallpaper = wallpapers[index];
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setLoaded(false);
  }, []);

  useEffect(() => {
    reset();
  }, [index, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % wallpapers.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + wallpapers.length) % wallpapers.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onIndexChange, index, wallpapers.length]);

  const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0025;
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const onDoubleClick = () => {
    setScale((s) => {
      const next = s > 1.5 ? 1 : 2.5;
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStart.current = { dist, scale };
      dragStart.current = null;
    } else if (pointers.current.size === 1 && scale > 1) {
      dragStart.current = { x: e.clientX, y: e.clientY, tx: translate.x, ty: translate.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / (pinchStart.current.dist || 1);
      setScale(clampScale(pinchStart.current.scale * ratio));
    } else if (pointers.current.size === 1 && dragStart.current && scale > 1) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslate({ x: dragStart.current.tx + dx, y: dragStart.current.ty + dy });
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  };

  if (!wallpaper) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm animate-fade-in">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 p-4 text-white">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {wallpaper.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-white/50 sm:inline">
            {wallpaper.width}×{wallpaper.height}
          </span>
          <a
            href={wallpaper.downloadUrl}
            download
            className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Download HD
          </a>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-white/15 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* image stage */}
      <div
        ref={containerRef}
        className="relative flex-1 touch-none select-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={onDoubleClick}
      >
        {!loaded && (
          <img
            src={wallpaper.gridUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-contain opacity-40 blur-xl"
          />
        )}
        <img
          src={wallpaper.fullUrl}
          alt={wallpaper.publicId}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 m-auto h-full w-full object-contain"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
            transition: pinchStart.current || dragStart.current ? "none" : "transform 0.15s ease-out",
          }}
        />

        {wallpapers.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange((index - 1 + wallpapers.length) % wallpapers.length)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white sm:left-4"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => onIndexChange((index + 1) % wallpapers.length)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur transition hover:bg-black/60 hover:text-white sm:right-4"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="p-3 text-center text-xs text-white/40">
        Scroll or pinch to zoom · double-tap to reset · drag to pan
      </div>
    </div>
  );
}
