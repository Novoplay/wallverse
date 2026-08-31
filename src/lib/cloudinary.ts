import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = "wallverse";

export const CATEGORIES = [
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
] as const;

export type Category = (typeof CATEGORIES)[number];

export type { Wallpaper } from "@/types";
import type { Wallpaper } from "@/types";

function toWallpaper(resource: any): Wallpaper {
  const publicId: string = resource.public_id;
  const base = cloudinary.url(publicId, { secure: true });
  return {
    id: resource.asset_id ?? publicId,
    publicId,
    width: resource.width,
    height: resource.height,
    format: resource.format,
    createdAt: resource.created_at,
    tags: resource.tags ?? [],
    // small blurred-ish placeholder-friendly thumb for grid on slow connections
    thumbUrl: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 60, quality: "auto:low", fetch_format: "auto" }],
    }),
    // responsive grid image
    gridUrl: cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: 600, crop: "fill", gravity: "auto", quality: "auto:good", fetch_format: "auto" },
      ],
    }),
    // full quality for the HD zoom viewer
    fullUrl: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ quality: "auto:best", fetch_format: "auto" }],
    }),
    // forces a real download of the original file
    downloadUrl: cloudinary.url(publicId, {
      secure: true,
      flags: "attachment",
    }),
  };
}

export async function listWallpapers(opts: { tag?: string; query?: string } = {}) {
  const { tag, query } = opts;

  let expression = `folder:${CLOUDINARY_FOLDER}`;
  if (tag && tag !== "All") {
    expression += ` AND tags=${JSON.stringify(tag).replace(/"/g, "")}`;
  }
  if (query) {
    const safe = query.replace(/["\\]/g, "");
    expression += ` AND public_id:*${safe}*`;
  }

  const result = await cloudinary.search
    .expression(expression)
    .sort_by("created_at", "desc")
    .with_field("tags")
    .max_results(200)
    .execute();

  return (result.resources ?? []).map(toWallpaper);
}

export async function uploadWallpaper(
  buffer: Buffer,
  filename: string,
  tags: string[]
): Promise<Wallpaper> {
  const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        public_id: `${cleanName}-${Date.now()}`,
        tags: tags.length ? tags : ["Other"],
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
  return toWallpaper(result);
}

export async function deleteWallpaper(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
