import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "WallVerse — HD Wallpapers",
  description:
    "A clean, fast wallpaper gallery. Browse and download full-HD wallpapers, zoom in for detail, all in one place.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-gray-500">
          Built with WallVerse · wallpapers for everyone
        </footer>
      </body>
    </html>
  );
}
