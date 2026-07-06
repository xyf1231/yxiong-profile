// gradient-presets.js
// 50 种渐变预设 — Apple / Morandi / Classic 三大系列
// 每种 6 个色阶（stops），可直接用于 @kumailnanji/letters 的 SVG 渐变或 CSS
// 包含 HSL 亮度/饱和度调节工具函数

export const GRADIENT_PRESETS = {
  // ==================== Apple 系列（15 种）====================
  midnight: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a0a1a' },
      { offset: '20%', color: '#1a1a3a' },
      { offset: '40%', color: '#2a2a5a' },
      { offset: '60%', color: '#3a3a7a' },
      { offset: '80%', color: '#4a4a9a' },
      { offset: '100%',color: '#5a5aba' }
    ]
  },
  graphite: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#1a1a1c' },
      { offset: '20%', color: '#2a2a2e' },
      { offset: '40%', color: '#3a3a3e' },
      { offset: '60%', color: '#4a4a4e' },
      { offset: '80%', color: '#5a5a5e' },
      { offset: '100%',color: '#6a6a6e' }
    ]
  },
  pacific: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a2a2a' },
      { offset: '20%', color: '#0a3a4a' },
      { offset: '40%', color: '#1a4a6a' },
      { offset: '60%', color: '#2a5a8a' },
      { offset: '80%', color: '#3a6aaa' },
      { offset: '100%',color: '#4a7aca' }
    ]
  },
  alpine: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a2a1a' },
      { offset: '20%', color: '#1a3a2a' },
      { offset: '40%', color: '#2a4a3a' },
      { offset: '60%', color: '#3a5a4a' },
      { offset: '80%', color: '#4a6a5a' },
      { offset: '100%',color: '#5a7a6a' }
    ]
  },
  slate: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#1a2a3a' },
      { offset: '20%', color: '#2a3a4a' },
      { offset: '40%', color: '#3a4a5a' },
      { offset: '60%', color: '#4a5a6a' },
      { offset: '80%', color: '#5a6a7a' },
      { offset: '100%',color: '#6a7a8a' }
    ]
  },
  indigo: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#1a1a3a' },
      { offset: '20%', color: '#2a2a5a' },
      { offset: '40%', color: '#3a3a7a' },
      { offset: '60%', color: '#4a4a9a' },
      { offset: '80%', color: '#5a5aba' },
      { offset: '100%',color: '#6a6ada' }
    ]
  },
  silver: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#3a3a3a' },
      { offset: '20%', color: '#4a4a4a' },
      { offset: '40%', color: '#5a5a5a' },
      { offset: '60%', color: '#6a6a6a' },
      { offset: '80%', color: '#7a7a7a' },
      { offset: '100%',color: '#8a8a8a' }
    ]
  },
  'rose-gold': {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#5a3a3a' },
      { offset: '20%', color: '#6a4a4a' },
      { offset: '40%', color: '#7a5a5a' },
      { offset: '60%', color: '#8a6a6a' },
      { offset: '80%', color: '#9a7a7a' },
      { offset: '100%',color: '#aa8a8a' }
    ]
  },
  sky: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a2a4a' },
      { offset: '20%', color: '#1a3a5a' },
      { offset: '40%', color: '#2a4a6a' },
      { offset: '60%', color: '#3a5a7a' },
      { offset: '80%', color: '#4a6a8a' },
      { offset: '100%',color: '#5a7a9a' }
    ]
  },
  sage: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a2a1a' },
      { offset: '20%', color: '#1a3a2a' },
      { offset: '40%', color: '#2a4a3a' },
      { offset: '60%', color: '#3a5a4a' },
      { offset: '80%', color: '#4a6a5a' },
      { offset: '100%',color: '#5a7a6a' }
    ]
  },
  titanium: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#2a2a2a' },
      { offset: '20%', color: '#3a3a3a' },
      { offset: '40%', color: '#4a4a4a' },
      { offset: '60%', color: '#5a5a5a' },
      { offset: '80%', color: '#6a6a6a' },
      { offset: '100%',color: '#7a7a7a' }
    ]
  },
  ocean: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#0a2a3a' },
      { offset: '20%', color: '#1a3a5a' },
      { offset: '40%', color: '#2a4a7a' },
      { offset: '60%', color: '#3a5a9a' },
      { offset: '80%', color: '#4a6aba' },
      { offset: '100%',color: '#5a7aca' }
    ]
  },
  mist: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#2a3a4a' },
      { offset: '20%', color: '#3a4a5a' },
      { offset: '40%', color: '#4a5a6a' },
      { offset: '60%', color: '#5a6a7a' },
      { offset: '80%', color: '#6a7a8a' },
      { offset: '100%',color: '#7a8a9a' }
    ]
  },
  orchid: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#3a2a3a' },
      { offset: '20%', color: '#4a3a4a' },
      { offset: '40%', color: '#5a4a5a' },
      { offset: '60%', color: '#6a5a6a' },
      { offset: '80%', color: '#7a6a7a' },
      { offset: '100%',color: '#8a7a8a' }
    ]
  },
  bronze: {
    cat: 'apple',
    stops: [
      { offset: '0%',  color: '#4a3a2a' },
      { offset: '20%', color: '#5a4a3a' },
      { offset: '40%', color: '#6a5a4a' },
      { offset: '60%', color: '#7a6a5a' },
      { offset: '80%', color: '#8a7a6a' },
      { offset: '100%',color: '#9a8a7a' }
    ]
  },

  // ==================== Morandi 系列（15 种）====================
  'dusty-rose': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#6a4a4a' },
      { offset: '20%', color: '#7a5a5a' },
      { offset: '40%', color: '#8a6a6a' },
      { offset: '60%', color: '#9a7a7a' },
      { offset: '80%', color: '#aa8a8a' },
      { offset: '100%',color: '#ba9a9a' }
    ]
  },
  'muted-sage': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#4a6a5a' },
      { offset: '20%', color: '#5a7a6a' },
      { offset: '40%', color: '#6a8a7a' },
      { offset: '60%', color: '#7a9a8a' },
      { offset: '80%', color: '#8aaa9a' },
      { offset: '100%',color: '#9abaaa' }
    ]
  },
  'steel-blue': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#4a5a6a' },
      { offset: '20%', color: '#5a6a7a' },
      { offset: '40%', color: '#6a7a8a' },
      { offset: '60%', color: '#7a8a9a' },
      { offset: '80%', color: '#8a9aaa' },
      { offset: '100%',color: '#9ababa' }
    ]
  },
  'warm-sand': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#7a6a5a' },
      { offset: '20%', color: '#8a7a6a' },
      { offset: '40%', color: '#9a8a7a' },
      { offset: '60%', color: '#aa9a8a' },
      { offset: '80%', color: '#baaa9a' },
      { offset: '100%',color: '#cabab9' }
    ]
  },
  'soft-lilac': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#5a4a6a' },
      { offset: '20%', color: '#6a5a7a' },
      { offset: '40%', color: '#7a6a8a' },
      { offset: '60%', color: '#8a7a9a' },
      { offset: '80%', color: '#9a8aaa' },
      { offset: '100%',color: '#aa9aba' }
    ]
  },
  terracotta: {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#7a5a4a' },
      { offset: '20%', color: '#8a6a5a' },
      { offset: '40%', color: '#9a7a6a' },
      { offset: '60%', color: '#aa8a7a' },
      { offset: '80%', color: '#ba9a8a' },
      { offset: '100%',color: '#caab9a' }
    ]
  },
  seafoam: {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#4a6a5a' },
      { offset: '20%', color: '#5a7a6a' },
      { offset: '40%', color: '#6a8a7a' },
      { offset: '60%', color: '#7a9a8a' },
      { offset: '80%', color: '#8aaaba' },
      { offset: '100%',color: '#9abaca' }
    ]
  },
  'soft-peach': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#8a6a5a' },
      { offset: '20%', color: '#9a7a6a' },
      { offset: '40%', color: '#aa8a7a' },
      { offset: '60%', color: '#ba9a8a' },
      { offset: '80%', color: '#caaaaa' },
      { offset: '100%',color: '#dababa' }
    ]
  },
  'dusty-lavender': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#5a4a6a' },
      { offset: '20%', color: '#6a5a7a' },
      { offset: '40%', color: '#7a6a8a' },
      { offset: '60%', color: '#8a7a9a' },
      { offset: '80%', color: '#9a8aaa' },
      { offset: '100%',color: '#aa9aba' }
    ]
  },
  'olive-gray': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#5a5a4a' },
      { offset: '20%', color: '#6a6a5a' },
      { offset: '40%', color: '#7a7a6a' },
      { offset: '60%', color: '#8a8a7a' },
      { offset: '80%', color: '#9a9a8a' },
      { offset: '100%',color: '#aaaa9a' }
    ]
  },
  'muted-blush': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#8a6a6a' },
      { offset: '20%', color: '#9a7a7a' },
      { offset: '40%', color: '#aa8a8a' },
      { offset: '60%', color: '#ba9a9a' },
      { offset: '80%', color: '#caaaaa' },
      { offset: '100%',color: '#dababa' }
    ]
  },
  'slate-rose': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#5a4a5a' },
      { offset: '20%', color: '#6a5a6a' },
      { offset: '40%', color: '#7a6a7a' },
      { offset: '60%', color: '#8a7a8a' },
      { offset: '80%', color: '#9a8a9a' },
      { offset: '100%',color: '#aa9aaa' }
    ]
  },
  'cream-stone': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#8a7a6a' },
      { offset: '20%', color: '#9a8a7a' },
      { offset: '40%', color: '#aa9a8a' },
      { offset: '60%', color: '#baaa9a' },
      { offset: '80%', color: '#cabaaa' },
      { offset: '100%',color: '#dacaba' }
    ]
  },
  'mint-gray': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#4a6a5a' },
      { offset: '20%', color: '#5a7a6a' },
      { offset: '40%', color: '#6a8a7a' },
      { offset: '60%', color: '#7a9a8a' },
      { offset: '80%', color: '#8aaaba' },
      { offset: '100%',color: '#9ababa' }
    ]
  },
  'mauve-gray': {
    cat: 'morandi',
    stops: [
      { offset: '0%',  color: '#6a5a6a' },
      { offset: '20%', color: '#7a6a7a' },
      { offset: '40%', color: '#8a7a8a' },
      { offset: '60%', color: '#9a8a9a' },
      { offset: '80%', color: '#aa9aaa' },
      { offset: '100%',color: '#ba9aba' }
    ]
  },

  // ==================== Classic 系列（20 种）====================
  golden: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#8B4513' },
      { offset: '20%', color: '#CD853F' },
      { offset: '40%', color: '#DAA520' },
      { offset: '60%', color: '#FFD700' },
      { offset: '80%', color: '#F0E68C' },
      { offset: '100%',color: '#FFFACD' }
    ]
  },
  crimson: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#4a0000' },
      { offset: '20%', color: '#800000' },
      { offset: '40%', color: '#b30000' },
      { offset: '60%', color: '#dc143c' },
      { offset: '80%', color: '#ff4d6d' },
      { offset: '100%',color: '#ff8fa3' }
    ]
  },
  navy: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000080' },
      { offset: '20%', color: '#0033cc' },
      { offset: '40%', color: '#0055ff' },
      { offset: '60%', color: '#3377ff' },
      { offset: '80%', color: '#6699ff' },
      { offset: '100%',color: '#99bbff' }
    ]
  },
  emerald: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#004d40' },
      { offset: '20%', color: '#00695c' },
      { offset: '40%', color: '#00897b' },
      { offset: '60%', color: '#009688' },
      { offset: '80%', color: '#4db6ac' },
      { offset: '100%',color: '#80cbc4' }
    ]
  },
  ruby: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#3d0000' },
      { offset: '20%', color: '#660000' },
      { offset: '40%', color: '#990000' },
      { offset: '60%', color: '#cc0000' },
      { offset: '80%', color: '#ff0000' },
      { offset: '100%',color: '#ff5555' }
    ]
  },
  sapphire: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000033' },
      { offset: '20%', color: '#001a66' },
      { offset: '40%', color: '#003399' },
      { offset: '60%', color: '#0044cc' },
      { offset: '80%', color: '#3366ff' },
      { offset: '100%',color: '#6688ff' }
    ]
  },
  amber: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#6b3100' },
      { offset: '20%', color: '#8b4513' },
      { offset: '40%', color: '#b87333' },
      { offset: '60%', color: '#daa520' },
      { offset: '80%', color: '#ffd700' },
      { offset: '100%',color: '#ffec8b' }
    ]
  },
  violet: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#1a0033' },
      { offset: '20%', color: '#330066' },
      { offset: '40%', color: '#4d0099' },
      { offset: '60%', color: '#6600cc' },
      { offset: '80%', color: '#7f00ff' },
      { offset: '100%',color: '#aa55ff' }
    ]
  },
  teal: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#003333' },
      { offset: '20%', color: '#006666' },
      { offset: '40%', color: '#009999' },
      { offset: '60%', color: '#00cccc' },
      { offset: '80%', color: '#00ffff' },
      { offset: '100%',color: '#55ffff' }
    ]
  },
  coral: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#6b0000' },
      { offset: '20%', color: '#993333' },
      { offset: '40%', color: '#cc5555' },
      { offset: '60%', color: '#ff7f50' },
      { offset: '80%', color: '#ffa07a' },
      { offset: '100%',color: '#ffccaa' }
    ]
  },
  rainbow: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#ff0000' },
      { offset: '20%', color: '#ff7f00' },
      { offset: '40%', color: '#ffff00' },
      { offset: '60%', color: '#00ff00' },
      { offset: '80%', color: '#0000ff' },
      { offset: '100%',color: '#8b00ff' }
    ]
  },
  sunrise: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#2d0036' },
      { offset: '20%', color: '#800080' },
      { offset: '40%', color: '#ff1493' },
      { offset: '60%', color: '#ff8c00' },
      { offset: '80%', color: '#ffd700' },
      { offset: '100%',color: '#ffffe0' }
    ]
  },
  rasta: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#006400' },
      { offset: '20%', color: '#228b22' },
      { offset: '40%', color: '#ffd700' },
      { offset: '60%', color: '#ff8c00' },
      { offset: '80%', color: '#dc143c' },
      { offset: '100%',color: '#8b0000' }
    ]
  },
  plasma: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#0d0887' },
      { offset: '20%', color: '#7e03a8' },
      { offset: '40%', color: '#cc4778' },
      { offset: '60%', color: '#f89540' },
      { offset: '80%', color: '#f0f921' },
      { offset: '100%',color: '#ffffff' }
    ]
  },
  aurora: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#004d00' },
      { offset: '20%', color: '#00b300' },
      { offset: '40%', color: '#00ffff' },
      { offset: '60%', color: '#0080ff' },
      { offset: '80%', color: '#8000ff' },
      { offset: '100%',color: '#ff00ff' }
    ]
  },
  heat: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000000' },
      { offset: '20%', color: '#330000' },
      { offset: '40%', color: '#ff0000' },
      { offset: '60%', color: '#ff6600' },
      { offset: '80%', color: '#ffff00' },
      { offset: '100%',color: '#ffffff' }
    ]
  },
  'ice-fire': {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#00008b' },
      { offset: '20%', color: '#00ced1' },
      { offset: '40%', color: '#00ff00' },
      { offset: '60%', color: '#ffff00' },
      { offset: '80%', color: '#ff4500' },
      { offset: '100%',color: '#ff0000' }
    ]
  },
  sunset: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000033' },
      { offset: '20%', color: '#4b0082' },
      { offset: '40%', color: '#ff1493' },
      { offset: '60%', color: '#ff4500' },
      { offset: '80%', color: '#dc143c' },
      { offset: '100%',color: '#4a0000' }
    ]
  },
  oceanic: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000000' },
      { offset: '20%', color: '#000080' },
      { offset: '40%', color: '#008b8b' },
      { offset: '60%', color: '#00fa9a' },
      { offset: '80%', color: '#7fff00' },
      { offset: '100%',color: '#ffffff' }
    ]
  },
  neon: {
    cat: 'classic',
    stops: [
      { offset: '0%',  color: '#000000' },
      { offset: '20%', color: '#9400d3' },
      { offset: '40%', color: '#ff00ff' },
      { offset: '60%', color: '#00ffff' },
      { offset: '80%', color: '#39ff14' },
      { offset: '100%',color: '#ffff00' }
    ]
  }
};

// ==================== 工具函数 ====================

/**
 * 解析 hex 颜色为 HSL 对象
 * @param {string} hex - 如 '#ff0000' 或 '#f00'
 * @returns {{h:number,s:number,l:number}} HSL 对象（s、l 为 0-1 小数）
 */
export function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

/**
 * HSL 转 hex 颜色
 * @param {{h:number,s:number,l:number}} hsl
 * @returns {string} 如 '#ff0000'
 */
export function hslToHex({ h, s, l }) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x) => {
    const v = Math.round(x * 255);
    return v.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 对单个 hex 颜色应用亮度和饱和度调节
 * @param {string} color - hex 颜色
 * @param {number} brightness - 亮度百分比 (-100 到 100)
 * @param {number} saturation - 饱和度百分比 (-100 到 100)
 * @returns {string} 调节后的 hex 颜色
 */
export function applyColorAdjustment(color, brightness, saturation) {
  if (!brightness && !saturation) return color;
  const hsl = hexToHsl(color);
  hsl.l = Math.max(0, Math.min(1, hsl.l + (brightness || 0) / 100));
  hsl.s = Math.max(0, Math.min(1, hsl.s + (saturation || 0) / 100));
  return hslToHex(hsl);
}

/**
 * 对预设的每个 stop 应用亮度和饱和度调节
 * @param {string} presetKey - 预设名称
 * @param {number} brightness - 亮度百分比
 * @param {number} saturation - 饱和度百分比
 * @returns {Array<{offset:string,color:string}>} 调节后的 stops
 */
export function getAdjustedStops(presetKey, brightness, saturation) {
  const def = GRADIENT_PRESETS[presetKey];
  if (!def) return [];
  return def.stops.map(s => ({
    offset: s.offset,
    color: applyColorAdjustment(s.color, brightness, saturation)
  }));
}

/**
 * 生成 CSS linear-gradient 字符串
 * @param {string} presetKey - 预设名称
 * @param {number} [brightness] - 亮度调节
 * @param {number} [saturation] - 饱和度调节
 * @param {number} [angle] - 角度，默认 90deg
 * @returns {string} CSS gradient 字符串
 */
export function getCssGradient(presetKey, brightness, saturation, angle = 90) {
  const stops = getAdjustedStops(presetKey, brightness, saturation);
  const stopStr = stops.map(s => `${s.color} ${s.offset}`).join(', ');
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

/**
 * 获取所有预设的键名
 * @returns {string[]}
 */
export function getPresetKeys() {
  return Object.keys(GRADIENT_PRESETS);
}

/**
 * 按分类获取预设键名
 * @param {'apple'|'morandi'|'classic'} category
 * @returns {string[]}
 */
export function getPresetKeysByCategory(category) {
  return Object.entries(GRADIENT_PRESETS)
    .filter(([, v]) => v.cat === category)
    .map(([k]) => k);
}

/**
 * 获取所有分类
 * @returns {string[]}
 */
export function getCategories() {
  return ['apple', 'morandi', 'classic'];
}

/**
 * 随机获取一个预设键名
 * @param {'apple'|'morandi'|'classic'|'all'} [category] - 分类过滤，默认 'all'
 * @returns {string|null}
 */
export function getRandomPreset(category = 'all') {
  let keys = getPresetKeys();
  if (category !== 'all') {
    keys = keys.filter(k => GRADIENT_PRESETS[k].cat === category);
  }
  if (keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * 生成 React SVG linearGradient 元素（用于 @kumailnanji/letters）
 * 需要 React 环境
 * @param {string} presetKey - 预设名称
 * @param {number} [brightness] - 亮度调节
 * @param {number} [saturation] - 饱和度调节
 * @returns {Object} React.createElement 参数对象，需自行调用 React.createElement
 */
export function createGradientProps(presetKey, brightness, saturation) {
  const stops = getAdjustedStops(presetKey, brightness, saturation);
  return {
    id: 'letters-gradient',
    x1: '0%', y1: '0%', x2: '100%', y2: '0%',
    gradientUnits: 'userSpaceOnUse',
    stops: stops.map((stop, i) => ({ key: i, offset: stop.offset, stopColor: stop.color }))
  };
}

// 默认导出
export default GRADIENT_PRESETS;
