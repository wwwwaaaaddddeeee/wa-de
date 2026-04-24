"use client";

import { useEffect, useMemo, useRef } from "react";
import { rasterizePath, rasterizeText, type Point } from "./rasterize";

const GRID_DESKTOP = 205;                  // shape coordinate space (desktop)
const GRID_MOBILE = 130;                   // ~60% fewer dots on small viewports
const MOBILE_MAX_WIDTH = 768;              // css px below which we drop to GRID_MOBILE

function resolveGrid(override?: number): number {
  if (override != null) return override;
  if (typeof window === "undefined") return GRID_DESKTOP;
  return window.innerWidth <= MOBILE_MAX_WIDTH ? GRID_MOBILE : GRID_DESKTOP;
}
const BR_STEPS = 20;                       // brightness quantization divisor (21 steps: 0..20)
const TINT_STEPS = 24;                     // tint buckets — higher = smoother color sweep
const BUCKETS = (BR_STEPS + 1) * TINT_STEPS; // 504

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(f(h + 1 / 3) * 255),
    Math.round(f(h) * 255),
    Math.round(f(h - 1 / 3) * 255),
  ];
}

function lerpHue(a: number, b: number, t: number): number {
  let d = b - a;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return (a + d * t + 1) % 1;
}

// Ordered 8x8 Bayer matrix, normalized to 0..1.
const BAYER_8 = new Float32Array([
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => v / 64));

export type GradientDirection = "diagonal" | "horizontal" | "vertical" | "radial" | "none";

function gradientValue(dir: GradientDirection, x: number, y: number, grid: number): number {
  const nx = x / (grid - 1);
  const ny = y / (grid - 1);
  switch (dir) {
    case "horizontal": return 1 - nx;
    case "vertical":   return 1 - ny;
    case "radial": {
      const dx = nx - 0.5, dy = ny - 0.5;
      return 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
    }
    case "none":       return 1;
    case "diagonal":
    default:           return 1 - (nx + ny) * 0.5;
  }
}

export type DitheredLogoProps = {
  /** Precomputed [x,y] points on a GRID×GRID space. Takes precedence over `path`/`text`. */
  points?: Point[];
  /** SVG path `d` string, or array of paths unioned together. Rasterized at mount. */
  path?: string | string[];
  /** Path viewBox. Number for square, or `[width, height]`. Defaults to 100. */
  viewBox?: number | [number, number];
  /** Text glyph(s) to rasterize. Used if `points` and `path` are absent. */
  text?: string;
  /** Canvas logical size in px. Defaults to 360. */
  size?: number;
  /** 0–1. How much of the canvas the shape occupies. */
  scale?: number;
  /** Dot size multiplier. */
  dotScale?: number;
  /** If true, dots fill the rounded-square tile *minus* the shape (shape becomes a cutout). */
  invert?: boolean;
  /** Scale the inner cutout shape relative to the outer tile. Defaults to 1. */
  innerScale?: number;
  /** Primary RGB dot color. */
  color?: [number, number, number];
  /** Optional secondary RGB dot color for tint blending. */
  accentColor?: [number, number, number];
  /** Optional middle RGB color stop for a 3-stop color → mid → accent blend. */
  midColor?: [number, number, number];
  /**
   * Conic HSL gradient. When set, tint is the polar angle around (cx, cy) and
   * each dot's color is `hsl(tint * 360 + offset*360, s, l)` — full hue wheel.
   * Overrides color / midColor / accentColor.
   */
  colorWheel?: {
    /** Center x in 0..1 of the shape grid. Defaults to 0.5. */
    cx?: number;
    /** Center y in 0..1 of the shape grid. Defaults to 0.5. */
    cy?: number;
    /** Hue offset 0..1. Sets which hue is at angle 0 (east). Defaults to 0. */
    offset?: number;
    /** Saturation 0..1. Defaults to 0.55. */
    s?: number;
    /** Lightness 0..1. Defaults to 0.68. */
    l?: number;
    /** Sweep direction. Defaults to counter-clockwise in screen space. */
    clockwise?: boolean;
  };
  /** Direction of the dithered gradient fade. Defaults to "diagonal". */
  gradient?: GradientDirection;
  /** How sharp the dither threshold is (1 = full dither, 0 = smooth alpha). Defaults to 0.85. */
  gradientSharpness?: number;
  /** Minimum brightness floor so the darkest side isn't empty. Defaults to 0.12. */
  gradientFloor?: number;
  /** Draw dashed outlines around the outer tile and the icon shape. */
  outline?: boolean;
  /** Outline stroke color. Defaults to fuchsia. */
  outlineColor?: string;
  /** Shockwave tuning */
  shockwaveSpeed?: number;      // px/sec
  shockwaveWidth?: number;      // ring thickness
  shockwaveStrength?: number;   // peak displacement
  shockwaveDuration?: number;   // ms
  /** Explicit shape-coordinate grid resolution. Auto: 205 on desktop, 130 on ≤768px. */
  grid?: number;
};

type State = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  count: number;
  baseX: Float32Array;
  baseY: Float32Array;
  renderX: Float32Array;
  renderY: Float32Array;
  brightness: Float32Array;
  size: Float32Array;
  tint: Float32Array;
  tintBayer: Float32Array;
  displaceX: Float32Array;
  displaceY: Float32Array;
  buckets: { indices: Int32Array[]; lengths: Int32Array };
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  shockwaves: { x: number; y: number; start: number }[];
  needsAnim: boolean;
  hasDisplacement: boolean;
  firstRender: boolean;
};

function buildGeometry(shape: Point[], invert: boolean, grid: number): Point[] {
  if (!invert) return shape;
  const occupied = new Set<number>();
  for (const [x, y] of shape) occupied.add(y * grid + x);
  // Full grid tile with 22% corner radius — shape is the cutout.
  const bw = grid, bh = grid;
  const r = Math.round(0.22 * Math.min(bw, bh));
  const inside = (x: number, y: number) => {
    if ((x >= r && x < bw - r) || (y >= r && y < bh - r)) return true;
    const cx = x < r ? r : bw - r - 1;
    const cy = y < r ? r : bh - r - 1;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  };
  const pts: Point[] = [];
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      if (inside(x, y) && !occupied.has(y * grid + x)) pts.push([x, y]);
    }
  }
  return pts;
}

type GeomCfg = {
  scale: number;
  dotScale: number;
  invert: boolean;
  gradient: GradientDirection;
  gradientSharpness: number;
  gradientFloor: number;
  colorWheel: DitheredLogoProps["colorWheel"] | null;
};

function makeState(canvas: HTMLCanvasElement, shape: Point[], cfg: GeomCfg, grid: number): State {
  // Cap DPR so phones (often 3×) render 4/9× fewer pixels per frame.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pts = buildGeometry(shape, cfg.invert, grid);
  const count = pts.length;

  const dotPitch = Math.max(0.5, (Math.min(w, h) * cfg.scale) / grid);
  const offX = Math.round((w - grid * dotPitch) / 2);
  const offY = Math.round((h - grid * dotPitch) / 2);

  const baseX = new Float32Array(count);
  const baseY = new Float32Array(count);
  const brightness = new Float32Array(count);
  const size = new Float32Array(count);
  const tint = new Float32Array(count);
  const tintBayer = new Float32Array(count);

  const sharp = Math.max(0, Math.min(1, cfg.gradientSharpness));
  const floor = Math.max(0, Math.min(1, cfg.gradientFloor));
  const wheel = cfg.colorWheel;
  const wheelCx = wheel ? (wheel.cx ?? 0.5) * (grid - 1) : 0;
  const wheelCy = wheel ? (wheel.cy ?? 0.5) * (grid - 1) : 0;
  const wheelSign = wheel?.clockwise ? 1 : -1;
  const TWO_PI = Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const px = pts[i][0], py = pts[i][1];
    baseX[i] = offX + px * dotPitch;
    baseY[i] = offY + py * dotPitch;
    size[i] = dotPitch * cfg.dotScale;
    if (wheel) {
      // Polar angle around (wheelCx, wheelCy). Screen +y is down, so negate dy
      // when we want counter-clockwise sweep to match the math convention.
      const a = Math.atan2(wheelSign * (py - wheelCy), px - wheelCx);
      tint[i] = (a / TWO_PI + 1) % 1;
    } else {
      tint[i] = px / (grid - 1);
    }

    const threshold = BAYER_8[(py & 7) * 8 + (px & 7)];
    // Offset Bayer pattern on tint axis so its dither mask decorrelates from
    // the brightness-axis mask — otherwise the two patterns align and produce
    // visible stripes instead of breaking up the color bands.
    tintBayer[i] = BAYER_8[((py + 3) & 7) * 8 + ((px + 5) & 7)];

    const g = gradientValue(cfg.gradient, px, py, grid);
    // Mix smooth alpha (sharp=0) with dithered step (sharp=1).
    const dithered = g > threshold ? 1 : 0;
    const mixed = g * (1 - sharp) + dithered * sharp;
    brightness[i] = floor + (1 - floor) * mixed;
  }

  const indices: Int32Array[] = new Array(BUCKETS);
  for (let i = 0; i < BUCKETS; i++) indices[i] = new Int32Array(count);

  return {
    ctx, w, h, dpr,
    count,
    baseX, baseY,
    renderX: new Float32Array(baseX),
    renderY: new Float32Array(baseY),
    brightness, size, tint, tintBayer,
    displaceX: new Float32Array(count),
    displaceY: new Float32Array(count),
    buckets: { indices, lengths: new Int32Array(BUCKETS) },
    mouseX: -9999, mouseY: -9999, mouseActive: false,
    shockwaves: [],
    needsAnim: false,
    hasDisplacement: false,
    firstRender: false,
  };
}

function renderFrame(
  s: State,
  color: [number, number, number],
  accentColor: [number, number, number],
  midColor: [number, number, number] | null,
  wheelHSL: { offset: number; s: number; l: number } | null
) {
  const { ctx, renderX, renderY, brightness, size, tint, tintBayer, count, buckets, w, h } = s;
  ctx.clearRect(0, 0, w, h);

  buckets.lengths.fill(0);
  const maxTint = TINT_STEPS - 1;
  for (let i = 0; i < count; i++) {
    const br = brightness[i];
    if (br < 0.01) continue;
    // Bayer-dither the tint between its two neighboring buckets so bucket
    // borders become a stippled transition instead of a hard line.
    const tf = tint[i] * maxTint;
    const ti = tf | 0;
    const frac = tf - ti;
    const tIdx = frac > tintBayer[i] && ti < maxTint ? ti + 1 : ti;
    const bucket = TINT_STEPS * Math.round(br * BR_STEPS) + tIdx;
    const idx = buckets.lengths[bucket]++;
    buckets.indices[bucket][idx] = i;
  }

  // Precompute RGB for each tint step. With midColor we interpolate in HSL
  // space (hue/sat/light) for a perceptually natural rainbow instead of a
  // muddy linear-RGB blend. With wheelHSL we sweep a full hue wheel.
  const tintColors: [number, number, number][] = new Array(TINT_STEPS);
  const ha = midColor ? rgbToHsl(color) : null;
  const hm = midColor ? rgbToHsl(midColor) : null;
  const hb = midColor ? rgbToHsl(accentColor) : null;
  for (let k = 0; k < TINT_STEPS; k++) {
    const t = k / (TINT_STEPS - 1);
    if (wheelHSL) {
      tintColors[k] = hslToRgb([(t + wheelHSL.offset + 1) % 1, wheelHSL.s, wheelHSL.l]);
    } else if (ha && hm && hb) {
      const [a, c, u] = t < 0.5 ? [ha, hm, t * 2] : [hm, hb, (t - 0.5) * 2];
      tintColors[k] = hslToRgb([
        lerpHue(a[0], c[0], u),
        a[1] + (c[1] - a[1]) * u,
        a[2] + (c[2] - a[2]) * u,
      ]);
    } else {
      tintColors[k] = [
        Math.round(color[0] + (accentColor[0] - color[0]) * t),
        Math.round(color[1] + (accentColor[1] - color[1]) * t),
        Math.round(color[2] + (accentColor[2] - color[2]) * t),
      ];
    }
  }

  for (let bi = 0; bi < BUCKETS; bi++) {
    const len = buckets.lengths[bi];
    if (len === 0) continue;
    const alpha = Math.floor(bi / TINT_STEPS) / BR_STEPS;
    const [r, g, b] = tintColors[bi % TINT_STEPS];
    const idxs = buckets.indices[bi];
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    // Batch all rects for this color into one Path2D → one fill call.
    // ~20–30 fill calls/frame instead of ~38k fillRect calls.
    const path = new Path2D();
    for (let k = 0; k < len; k++) {
      const i = idxs[k];
      const sz = size[i];
      path.rect(renderX[i] - 0.25, renderY[i] - 0.25, sz + 0.5, sz + 0.5);
    }
    ctx.fill(path);
  }
}

export function DitheredLogo({
  points,
  path,
  viewBox = 100,
  text,
  size: canvasSize = 360,
  scale = 0.8,
  dotScale = 1,
  invert = true,
  innerScale = 1,
  outline = false,
  outlineColor = "#ff00aa",
  color,
  accentColor,
  midColor,
  colorWheel,
  gradient = "diagonal",
  gradientSharpness = 0.85,
  gradientFloor = 0.12,
  shockwaveSpeed = 225,
  shockwaveWidth = 37,
  shockwaveStrength = 20,
  shockwaveDuration = 675,
  grid: gridProp,
}: DitheredLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<State | null>(null);

  const rasterize = useMemo(() => {
    return (grid: number): Point[] => {
      if (points) return points;
      if (path) {
        const basePadding = 0.08;
        const padding = Math.max(0, Math.min(0.49, (1 - (1 - basePadding * 2) * innerScale) / 2));
        return rasterizePath(path, grid, { viewBox, padding });
      }
      if (text) return rasterizeText(text, grid);
      return [];
    };
  }, [points, path, viewBox, text, innerScale]);

  const cfg = useMemo(
    () => ({
      rasterize, size: canvasSize, scale, dotScale, invert,
      gradient, gradientSharpness, gradientFloor,
      shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration,
      colorWheel: colorWheel ?? null,
    }),
    [rasterize, canvasSize, scale, dotScale, invert,
     gradient, gradientSharpness, gradientFloor,
     shockwaveSpeed, shockwaveWidth, shockwaveStrength, shockwaveDuration,
     colorWheel]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialGrid = resolveGrid(gridProp);
    stateRef.current = makeState(canvas, rasterize(initialGrid), cfg, initialGrid);

    let raf: number | null = null;

    const tick = (now: number) => {
      const s = stateRef.current;
      if (!s) return;
      s.needsAnim = false;
      s.shockwaves = s.shockwaves.filter((w) => now - w.start < shockwaveDuration);
      const activeWaves = s.shockwaves.length > 0;

      if (s.mouseActive || activeWaves || s.hasDisplacement) {
        const mx = s.mouseX, my = s.mouseY;
        const amp = 1 + (s.shockwaves.length - 1) * 0.5;
        if (activeWaves) s.needsAnim = true;
        s.hasDisplacement = false;

        for (let i = 0; i < s.count; i++) {
          const bx = s.baseX[i], by = s.baseY[i];
          let tx = 0, ty = 0;

          if (s.mouseActive) {
            const dx = bx + s.displaceX[i] - mx;
            const dy = by + s.displaceY[i] - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < 10000 && d2 > 0.1) {
              const d = Math.sqrt(d2);
              const k = 1 - d / 100;
              const mag = k * k * k * 40;
              tx = (dx / d) * mag;
              ty = (dy / d) * mag;
            }
          }

          for (let wi = 0; wi < s.shockwaves.length; wi++) {
            const wv = s.shockwaves[wi];
            const age = now - wv.start;
            const radius = (age / 1000) * shockwaveSpeed;
            const fade = 1 - age / shockwaveDuration;
            const dx = bx - wv.x;
            const dy = by - wv.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.1) continue;
            const off = Math.abs(dist - radius);
            if (off < shockwaveWidth) {
              const mag = (1 - off / shockwaveWidth) * fade * shockwaveStrength * amp;
              tx += (dx / dist) * mag;
              ty += (dy / dist) * mag;
            }
          }

          s.displaceX[i] += (tx - s.displaceX[i]) * 0.12;
          s.displaceY[i] += (ty - s.displaceY[i]) * 0.12;
          if (Math.abs(s.displaceX[i]) < 0.01) s.displaceX[i] = 0;
          if (Math.abs(s.displaceY[i]) < 0.01) s.displaceY[i] = 0;
          if (s.displaceX[i] !== 0 || s.displaceY[i] !== 0) {
            s.needsAnim = true;
            s.hasDisplacement = true;
          }
          s.renderX[i] = bx + s.displaceX[i];
          s.renderY[i] = by + s.displaceY[i];
        }
      }

      const baseColor: [number, number, number] = color ?? (invert ? [0, 0, 0] : [138, 143, 152]);
      const blendColor: [number, number, number] = accentColor ?? baseColor;
      const wheelHSL = colorWheel
        ? { offset: colorWheel.offset ?? 0, s: colorWheel.s ?? 0.55, l: colorWheel.l ?? 0.68 }
        : null;
      renderFrame(s, baseColor, blendColor, midColor ?? null, wheelHSL);

      if (!s.firstRender) {
        s.firstRender = true;
        requestAnimationFrame(() => canvas.setAttribute("data-ready", ""));
      }

      raf = s.mouseActive || s.needsAnim ? requestAnimationFrame(tick) : null;
    };

    raf = requestAnimationFrame(tick);

    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const localPt = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s || e.pointerType !== "mouse") return;
      const { x, y } = localPt(e);
      s.mouseX = x; s.mouseY = y; s.mouseActive = true;
      kick();
    };
    const onLeave = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s || e.pointerType !== "mouse") return;
      s.mouseActive = false;
      kick();
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s) return;
      const { x, y } = localPt(e);
      s.shockwaves.push({ x, y, start: performance.now() });
      kick();
    };
    const onResize = () => {
      const g = resolveGrid(gridProp);
      stateRef.current = makeState(canvas, rasterize(g), cfg, g);
      kick();
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [cfg, rasterize, invert, color, accentColor, midColor, colorWheel, shockwaveDuration, shockwaveSpeed, shockwaveStrength, shockwaveWidth, gridProp]);

  const overlay = useMemo(() => {
    if (!outline) return null;
    const tileSize = canvasSize * scale;
    const tileOffset = (canvasSize - tileSize) / 2;
    const tileRadius = tileSize * 0.22;

    const basePadding = 0.08;
    const iconPadding = Math.max(0, Math.min(0.49, (1 - (1 - basePadding * 2) * innerScale) / 2));
    const [vbw, vbh] = Array.isArray(viewBox) ? viewBox : [viewBox, viewBox];
    const fit = (tileSize * (1 - iconPadding * 2)) / Math.max(vbw, vbh);
    const iconW = vbw * fit;
    const iconH = vbh * fit;
    const iconX = tileOffset + (tileSize - iconW) / 2;
    const iconY = tileOffset + (tileSize - iconH) / 2;
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];

    return (
      <svg
        width={canvasSize}
        height={canvasSize}
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect
          x={tileOffset}
          y={tileOffset}
          width={tileSize}
          height={tileSize}
          rx={tileRadius}
          ry={tileRadius}
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.25}
          strokeDasharray="4 3"
        />
        {paths.length > 0 && (
          <g transform={`translate(${iconX} ${iconY}) scale(${fit})`}>
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={outlineColor}
                strokeWidth={1.25 / fit}
                strokeDasharray={`${4 / fit} ${3 / fit}`}
              />
            ))}
          </g>
        )}
      </svg>
    );
  }, [outline, outlineColor, canvasSize, scale, innerScale, viewBox, path]);

  return (
    <div style={{ position: "relative", width: canvasSize, height: canvasSize }}>
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize, height: canvasSize, display: "block", touchAction: "manipulation" }}
      />
      {overlay}
    </div>
  );
}
