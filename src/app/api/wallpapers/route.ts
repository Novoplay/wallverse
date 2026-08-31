import { NextRequest, NextResponse } from "next/server";
import { listWallpapers } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  try {
    const wallpapers = await listWallpapers({ tag, query });
    return NextResponse.json({ wallpapers });
  } catch (err: any) {
    // If Cloudinary isn't configured yet, fail soft with an empty gallery
    // instead of a hard crash, so the site still loads.
    console.error("Failed to list wallpapers:", err?.message ?? err);
    return NextResponse.json(
      { wallpapers: [], error: "Cloudinary not configured yet." },
      { status: 200 }
    );
  }
}
