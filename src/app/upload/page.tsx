"use client";

import { useCallback, useRef, useState } from "react";

const CATEGORY_LIST = [
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

interface QueuedFile {
  file: File;
  preview: string;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

export default function UploadPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const withPreview = list.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setQueue((q) => [...q, ...withPreview]);
  }, []);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    // Verify password against the server without uploading anything yet.
    const res = await fetch("/api/upload", { method: "POST", headers: { "x-upload-password": password }, body: new FormData() });
    if (res.status === 401) {
      setAuthError("Wrong password.");
      return;
    }
    setUnlocked(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((tags) =>
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  };

  const removeFile = (idx: number) => {
    setQueue((q) => q.filter((_, i) => i !== idx));
  };

  const upload = async () => {
    if (!queue.length) return;
    setStatus("uploading");
    setMessage("");

    const form = new FormData();
    queue.forEach((q) => form.append("files", q.file));
    form.append("tags", selectedTags.join(","));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-upload-password": password },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Upload failed.");
        return;
      }
      const failed = (data.results ?? []).filter((r: any) => r.error);
      setStatus("done");
      setMessage(
        failed.length
          ? `Uploaded with ${failed.length} error(s).`
          : `Uploaded ${data.results.length} wallpaper(s) successfully!`
      );
      setQueue([]);
      setSelectedTags([]);
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 py-16">
        <h1 className="mb-1 text-2xl font-semibold">Upload wallpapers</h1>
        <p className="mb-6 text-center text-sm text-gray-400">
          Enter the upload password to add new wallpapers.
        </p>
        <form onSubmit={handleSubmitPassword} className="w-full space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Upload password"
            autoFocus
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          {authError && <p className="text-sm text-red-400">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold">Upload wallpapers</h1>
      <p className="mb-6 text-sm text-gray-400">
        Drag & drop images, pick categories, and publish to your gallery instantly.
      </p>

      {/* dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 text-center transition-colors ${
          dragActive ? "border-accent bg-accent/5" : "border-border hover:border-gray-600"
        }`}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-gray-500">
          <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-gray-300">
          <span className="font-medium text-accent-2">Click to browse</span> or drag images here
        </p>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP — any resolution</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* queue preview */}
      {queue.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {queue.map((q, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={q.preview} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeFile(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* categories */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-gray-300">Categories (optional)</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_LIST.map((c) => (
            <button
              key={c}
              onClick={() => toggleTag(c)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                selectedTags.includes(c)
                  ? "bg-gradient-to-r from-accent to-accent-2 text-white"
                  : "border border-border bg-surface text-gray-400 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={upload}
        disabled={!queue.length || status === "uploading"}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "uploading" ? "Uploading…" : `Upload ${queue.length || ""} wallpaper${queue.length === 1 ? "" : "s"}`}
      </button>

      {message && (
        <p className={`mt-3 text-center text-sm ${status === "error" ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
