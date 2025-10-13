import type { AspectRatio } from "~/utils/tauri";

export type RGBColor = [number, number, number];

export const DEFAULT_GRADIENT_FROM = [71, 133, 255] satisfies RGBColor;
export const DEFAULT_GRADIENT_TO = [255, 71, 102] satisfies RGBColor;

export const ASPECT_RATIOS = {
	wide: { name: "宽屏", ratio: [16, 9] },
	vertical: { name: "竖屏", ratio: [9, 16] },
	square: { name: "方形", ratio: [1, 1] },
	classic: { name: "经典", ratio: [4, 3] },
	tall: { name: "高", ratio: [3, 4] },
} satisfies Record<AspectRatio, { name: string; ratio: [number, number] }>;
