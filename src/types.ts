export interface Wallpaper {
  id: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  tags: string[];
  thumbUrl: string;
  gridUrl: string;
  fullUrl: string;
  downloadUrl: string;
}
