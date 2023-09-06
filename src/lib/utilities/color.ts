const { max, min, pow } = Math;

export const stringToColor = (str: string, saturation = 100, lightness = 75) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  return {
    h: hash % 360,
    l: lightness,
    s: saturation,
    string: `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`,
  };
};

function toHex(n: number) {
  let hex = n.toString(16);
  while (hex.length < 2) { hex = "0" + hex; }
  return hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

export function hslToRgb(hue: number, sat: number, light: number) {
  let t2;
  hue = hue / 60;
  if (light <= 0.5) {
    t2 = light * (sat + 1);
  } else {
    t2 = light + sat - (light * sat);
  }
  const t1 = light * 2 - t2;
  const r = hueToRgb(t1, t2, hue + 2) * 255;
  const g = hueToRgb(t1, t2, hue) * 255;
  const b = hueToRgb(t1, t2, hue - 2) * 255;
  return { b: b, g: g, r: r };
}
function hueToRgb(t1, t2, hue) {
  if (hue < 0) hue += 6;
  if (hue >= 6) hue -= 6;
  if (hue < 1) return (t2 - t1) * hue + t1;
  else if (hue < 3) return t2;
  else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
  else return t1;
}

const RED = 0.2126;
const GREEN = 0.7152;
const BLUE = 0.0722;

const GAMMA = 2.4;

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : pow((v + 0.055) / 1.055, GAMMA);
  });
  return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

export function contrast(rgb1: [number, number, number], rgb2: [number, number, number]) {
  const lum1 = luminance(...rgb1);
  const lum2 = luminance(...rgb2);
  const brightest = max(lum1, lum2);
  const darkest = min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
