import React from 'react';
import rawPresets from '../../Gradient presets/gradient-presets.json';

export interface GradientStop {
  offset: string;
  color: string;
}

export interface GradientPreset {
  cat: 'apple' | 'morandi' | 'classic' | 'colorful';
  stops: GradientStop[];
}

export const GRADIENT_PRESETS = rawPresets as Record<string, GradientPreset>;

export type GradientCategory = 'all' | 'apple' | 'morandi' | 'classic' | 'colorful';

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const hue = h / 360;
  const sat = s / 100;
  const light = l / 100;

  let r: number, g: number, b: number;

  if (sat === 0) {
    r = g = b = light;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  const toHex = (v: number) => {
    const hex = Math.round(v * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 对单个颜色进行亮度和饱和度调节
 * brightness: -100 ~ 100
 * saturation: -100 ~ 100
 */
export function applyColorAdjustment(
  color: string,
  brightness: number,
  saturation: number
): string {
  const hsl = hexToHsl(color);
  hsl.l = Math.max(0, Math.min(100, hsl.l + brightness));
  hsl.s = Math.max(0, Math.min(100, hsl.s + saturation));
  return hslToHex(hsl);
}

export function getAdjustedStops(
  presetKey: string,
  brightness: number,
  saturation: number
): GradientStop[] {
  const preset = GRADIENT_PRESETS[presetKey];
  if (!preset) return [];
  return preset.stops.map((stop) => ({
    offset: stop.offset,
    color: applyColorAdjustment(stop.color, brightness, saturation),
  }));
}

export function getCssGradient(
  presetKey: string,
  brightness: number,
  saturation: number,
  angle = 90
): string {
  const stops = getAdjustedStops(presetKey, brightness, saturation);
  const stopStr = stops.map((s) => `${s.color} ${s.offset}`).join(', ');
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

export function getPresetKeys(): string[] {
  return Object.keys(GRADIENT_PRESETS);
}

export function getPresetKeysByCategory(category: Exclude<GradientCategory, 'all'>): string[] {
  return Object.entries(GRADIENT_PRESETS)
    .filter(([, v]) => v.cat === category)
    .map(([k]) => k);
}

export function getCategories(): Exclude<GradientCategory, 'all'>[] {
  return ['apple', 'morandi', 'classic', 'colorful'];
}

export function getRandomPreset(category: GradientCategory = 'all'): string | null {
  let keys = getPresetKeys();
  if (category !== 'all') {
    keys = keys.filter((k) => GRADIENT_PRESETS[k].cat === category);
  }
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * 生成 React SVG linearGradient 元素
 */
export function createGradientElement(
  presetKey: string,
  brightness: number,
  saturation: number,
  info: { totalWidth: number; minY: number; maxY: number },
  id = 'letters-gradient'
): React.ReactElement {
  const stops = getAdjustedStops(presetKey, brightness, saturation);
  return React.createElement(
    'linearGradient',
    {
      id,
      x1: '0',
      y1: '0',
      x2: info.totalWidth,
      y2: '0',
      gradientUnits: 'userSpaceOnUse',
    },
    stops.map((stop, i) =>
      React.createElement('stop', {
        key: i,
        offset: stop.offset,
        stopColor: stop.color,
      })
    )
  );
}

export default GRADIENT_PRESETS;
