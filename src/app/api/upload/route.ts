import { NextRequest, NextResponse } from "next/server";
import { uploadWallpaper } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-upload-password");
  const expected = process.env.UPLOAD_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "Server missing UPLOAD_PASSWORD env var." },
      { status: 500 }
    );
  }
  if (!password || password !== expected) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const tagsRaw = form.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (!files.length) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  const results = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const wallpaper = await uploadWallpaper(buffer, file.name, tags);
      results.push(wallpaper);
    } catch (err: any) {
      results.push({ error: err?.message ?? "Upload failed", filename: file.name });
    }
  }

  return NextResponse.json({ results });
}
