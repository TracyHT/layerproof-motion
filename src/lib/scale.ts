import { useVideoConfig } from 'remotion';

// Shared responsive scale hook for brand kit scenes.
// For landscape (16:9 at 1920px wide): scale = 1.0 — no change to any values.
// For portrait (9:16 at 1080px wide): refWidth = 1280 → scale = 0.844.
//   Using 1280 instead of 1920 makes elements ~50% larger than the naive 0.5625,
//   filling the mobile screen with legible text and UI without overflowing.
// py() scales a vertical pixel value proportionally to the actual canvas height.
export function useVideoScale() {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  // Portrait uses a smaller reference so elements are larger and more readable on mobile
  const refWidth = isPortrait ? 1080 : 1920;
  const scale = width / refWidth;
  return {
    w: width,
    h: height,
    scale,
    isPortrait,
    px: (x: number) => x * scale,
    py: (y: number) => y * (height / 1080),
  };
}
