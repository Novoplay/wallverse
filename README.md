# WallVerse

A clean, fast HD wallpaper gallery. Browse, search by category, zoom in
(scroll or pinch), and download in full quality. Includes a simple
password-protected upload page so you can add your own wallpapers.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Cloudinary for image storage (free tier: 25GB)
- Deploys on Vercel

## 1. Create a free Cloudinary account

1. Go to https://cloudinary.com/users/register/free and sign up (no card needed).
2. On your Cloudinary **Dashboard**, copy: **Cloud name**, **API Key**, **API Secret**.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
UPLOAD_PASSWORD=pick-anything
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, then go to `/upload` to add your first wallpapers.

## 4. Deploy on Vercel

1. Push this project to a GitHub repo.
2. Go to https://vercel.com/new and import that repo.
3. In the Vercel project's **Environment Variables** settings, add the same
   4 variables from `.env.local`.
4. Deploy. Done — your site is live.

## Notes

- Wallpapers are stored in Cloudinary under the `wallverse` folder; nothing
  is stored on Vercel itself, so redeploys never lose your images.
- Categories are just tags you pick at upload time — add more by editing
  the `CATEGORIES` list in `src/lib/cloudinary.ts` (and the matching list
  in `src/components/Gallery.tsx` / `src/app/upload/page.tsx`).
- The `/upload` page is protected by the `UPLOAD_PASSWORD` env var only —
  it's a simple gate, not a full auth system. Don't reuse a sensitive
  password there.
