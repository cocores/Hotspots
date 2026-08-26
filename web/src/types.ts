// Mirrors ios/Hotspots/Models — both clients read/write the same Firestore
// "projects" collection, so field names and shapes must match exactly.

export type HotspotAnimation = "pulse" | "ripple" | "bounce" | "none";

export const ANIMATIONS: { value: HotspotAnimation; label: string }[] = [
  { value: "pulse", label: "Pulse" },
  { value: "ripple", label: "Ripple" },
  { value: "bounce", label: "Bounce" },
  { value: "none", label: "None" },
];

export const SWATCHES = [
  "#ff4d2e",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#ec4899",
  "#0ea5e9",
];

export interface HotspotStyle {
  colorHex: string;
  animation: HotspotAnimation;
  pulseSpeed: number;
}

export const defaultStyle = (): HotspotStyle => ({
  colorHex: "#ff4d2e",
  animation: "pulse",
  pulseSpeed: 2,
});

export type HotspotMediaType = "image" | "audio";

export interface HotspotMedia {
  type: HotspotMediaType;
  url: string;
  storagePath: string;
  fileName: string;
}

export interface Hotspot {
  id: string;
  x: number; // percent 0-100 of the image's displayed width
  y: number; // percent 0-100 of the image's displayed height
  title: string;
  text: string;
  link?: string | null;
  media?: HotspotMedia | null;
}

export interface HotspotProject {
  id: string;
  name: string;
  ownerId: string;
  imageURL: string;
  imageStoragePath: string;
  imageWidth: number;
  imageHeight: number;
  style: HotspotStyle;
  hotspots: Hotspot[];
  createdAt: number;
  updatedAt: number;
}

export function hasText(h: Hotspot): boolean {
  return !!h.text && h.text.trim().length > 0;
}
export function hasMedia(h: Hotspot): boolean {
  return !!h.media;
}
export function hasLink(h: Hotspot): boolean {
  return !!h.link && h.link.trim().length > 0;
}
