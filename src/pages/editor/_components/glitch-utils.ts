import type { GlitchEffectsData } from "./GlitchEffects";

/**
 * Apply glitch effects to a canvas context
 */
export function applyGlitchEffects(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  effects: GlitchEffectsData
) {
  if (!effects.enabled) return;

  // RGB Split Effect
  if (effects.rgbSplit.enabled && effects.rgbSplit.intensity > 0) {
    applyRGBSplit(ctx, canvas, effects.rgbSplit.intensity);
  }

  // Scanlines Effect
  if (effects.scanlines.enabled && effects.scanlines.intensity > 0) {
    applyScanlines(ctx, canvas, effects.scanlines.intensity, effects.scanlines.count);
  }

  // Digital Distortion Effect
  if (effects.distortion.enabled && effects.distortion.intensity > 0) {
    applyDistortion(ctx, canvas, effects.distortion.intensity, effects.distortion.frequency);
  }

  // Noise Effect
  if (effects.noise.enabled && effects.noise.intensity > 0) {
    applyNoise(ctx, canvas, effects.noise.intensity);
  }

  // Color Shift Effect
  if (effects.colorShift.enabled) {
    applyColorShift(ctx, canvas, effects.colorShift.hueShift, effects.colorShift.saturationShift);
  }
}

/**
 * RGB Split - Separates color channels
 */
function applyRGBSplit(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data);

  // Shift red channel right
  for (let y = 0; y < canvas.height; y++) {
    for (let x = intensity; x < canvas.width; x++) {
      const sourceIndex = (y * canvas.width + (x - intensity)) * 4;
      const targetIndex = (y * canvas.width + x) * 4;
      data[targetIndex] = tempData[sourceIndex]; // Red channel
    }
  }

  // Shift blue channel left
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width - intensity; x++) {
      const sourceIndex = (y * canvas.width + (x + intensity)) * 4;
      const targetIndex = (y * canvas.width + x) * 4;
      data[targetIndex + 2] = tempData[sourceIndex + 2]; // Blue channel
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Scanlines - Horizontal lines overlay
 */
function applyScanlines(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number,
  count: number
) {
  const spacing = canvas.height / count;
  ctx.globalAlpha = intensity / 100;
  ctx.fillStyle = "#000000";

  for (let i = 0; i < count; i++) {
    const y = i * spacing;
    ctx.fillRect(0, y, canvas.width, Math.max(1, spacing * 0.5));
  }

  ctx.globalAlpha = 1;
}

/**
 * Digital Distortion - Horizontal pixel displacement
 */
function applyDistortion(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number,
  frequency: number
) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;

  tempCtx.putImageData(imageData, 0, 0);

  // Clear original canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply distortion by slicing and shifting horizontal strips
  const sliceHeight = Math.max(1, Math.floor(canvas.height / frequency));

  for (let y = 0; y < canvas.height; y += sliceHeight) {
    const offset = (Math.random() - 0.5) * intensity * 2;
    ctx.drawImage(
      tempCanvas,
      0,
      y,
      canvas.width,
      sliceHeight,
      offset,
      y,
      canvas.width,
      sliceHeight
    );
  }
}

/**
 * Noise - Random grain overlay
 */
function applyNoise(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, intensity: number) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const noiseIntensity = (intensity / 100) * 50;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseIntensity * 2;
    data[i] += noise; // Red
    data[i + 1] += noise; // Green
    data[i + 2] += noise; // Blue
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Color Shift - Hue and saturation manipulation
 */
function applyColorShift(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  hueShift: number,
  saturationShift: number
) {
  if (hueShift === 0 && saturationShift === 0) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert RGB to HSL
    const hsl = rgbToHsl(r, g, b);

    // Apply shifts
    hsl.h = (hsl.h + hueShift / 360) % 1;
    if (hsl.h < 0) hsl.h += 1;
    hsl.s = Math.max(0, Math.min(1, hsl.s + saturationShift / 100));

    // Convert back to RGB
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

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
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number) {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
