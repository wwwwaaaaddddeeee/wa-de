#!/usr/bin/env node
// Static SVG snapshot of the dithered cube.
// Mirrors the runtime logic in src/components/ui/dithered-logo/DitheredLogo.tsx:
// polar-angle tint → HSL hue wheel, diagonal brightness gradient, Bayer dither
// on both axes. Output is a single <svg> with dots grouped by (tint, brightness)
// so the file stays small.
//
// Defaults match the live site. Run:
//   node scripts/export-dither.mjs --out dither.svg
//   node scripts/export-dither.mjs --size 1024 --tint-steps 36 --out hero.svg

import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

const BAYER_8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => v / 64);

function gradientValue(dir, x, y, grid) {
  const nx = x / (grid - 1);
  const ny = y / (grid - 1);
  switch (dir) {
    case "horizontal": return 1 - nx;
    case "vertical":   return 1 - ny;
    case "radial": {
      const dx = nx - 0.5, dy = ny - 0.5;
      return 1 - Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2);
    }
    case "none": return 1;
    default:     return 1 - (nx + ny) * 0.5; // diagonal
  }
}

function buildTilePoints(grid) {
  const r = Math.round(0.22 * grid);
  const inside = (x, y) => {
    if ((x >= r && x < grid - r) || (y >= r && y < grid - r)) return true;
    const cx = x < r ? r : grid - r - 1;
    const cy = y < r ? r : grid - r - 1;
    const dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  };
  const pts = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      if (inside(x, y)) pts.push([x, y]);
    }
  }
  return pts;
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
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

function rgbHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function num(s, d) { const n = parseFloat(s); return Number.isFinite(n) ? n : d; }

function main() {
  const { values } = parseArgs({
    options: {
      size:         { type: "string", default: "520" },
      scale:        { type: "string", default: "0.9" },
      grid:         { type: "string", default: "205" },
      offset:       { type: "string", default: "0.6" },
      saturation:   { type: "string", default: "0.85" },
      lightness:    { type: "string", default: "0.6" },
      cx:           { type: "string", default: "0.5" },
      cy:           { type: "string", default: "0.5" },
      clockwise:    { type: "boolean", default: false },
      gradient:     { type: "string", default: "diagonal" },
      sharpness:    { type: "string", default: "0.85" },
      floor:        { type: "string", default: "0.12" },
      "dot-scale":  { type: "string", default: "1" },
      "tint-steps": { type: "string", default: "24" },
      "br-steps":   { type: "string", default: "20" },
      bg:           { type: "string", default: "none" },
      out:          { type: "string", default: "dither.svg" },
    },
  });

  const size       = num(values.size, 520);
  const scale      = num(values.scale, 0.9);
  const grid       = Math.round(num(values.grid, 205));
  const offset     = num(values.offset, 0.6);
  const sat        = num(values.saturation, 0.85);
  const light      = num(values.lightness, 0.6);
  const cxFrac     = num(values.cx, 0.5);
  const cyFrac     = num(values.cy, 0.5);
  const sharpness  = Math.max(0, Math.min(1, num(values.sharpness, 0.85)));
  const floor      = Math.max(0, Math.min(1, num(values.floor, 0.12)));
  const dotScale   = num(values["dot-scale"], 1);
  const TINT_STEPS = Math.max(1, Math.round(num(values["tint-steps"], 24)));
  const BR_STEPS   = Math.max(1, Math.round(num(values["br-steps"], 20)));
  const dir        = values.gradient;
  const sign       = values.clockwise ? 1 : -1;
  const { bg, out } = values;

  const pts = buildTilePoints(grid);
  const dotPitch = Math.max(0.5, (size * scale) / grid);
  const offX = Math.round((size - grid * dotPitch) / 2);
  const offY = Math.round((size - grid * dotPitch) / 2);
  const dotSize = dotPitch * dotScale + 0.5;
  const cxAbs = cxFrac * (grid - 1);
  const cyAbs = cyFrac * (grid - 1);
  const TWO_PI = Math.PI * 2;
  const maxTint = TINT_STEPS - 1;

  // Precompute RGB for each tint step (k = 0..TINT_STEPS-1)
  const tintColors = Array.from({ length: TINT_STEPS }, (_, k) => {
    const t = k / maxTint;
    return rgbHex(hslToRgb((t + offset + 1) % 1, sat, light));
  });

  /** buckets[brIdx * TINT_STEPS + tIdx] = array of "x,y" strings */
  const buckets = new Map();

  for (const [px, py] of pts) {
    // brightness
    const gr = gradientValue(dir, px, py, grid);
    const thBr = BAYER_8[(py & 7) * 8 + (px & 7)];
    const dithered = gr > thBr ? 1 : 0;
    const mixed = gr * (1 - sharpness) + dithered * sharpness;
    const brightness = floor + (1 - floor) * mixed;
    const brIdx = Math.round(brightness * BR_STEPS);
    if (brIdx === 0) continue;

    // tint: polar angle around (cxAbs, cyAbs), with Bayer dither between adjacent buckets
    const a = Math.atan2(sign * (py - cyAbs), px - cxAbs);
    const tint = (a / TWO_PI + 1) % 1;
    const thTint = BAYER_8[((py + 3) & 7) * 8 + ((px + 5) & 7)];
    const tf = tint * maxTint;
    const ti = Math.floor(tf);
    const frac = tf - ti;
    const tIdx = frac > thTint && ti < maxTint ? ti + 1 : ti;

    const x = (offX + px * dotPitch - 0.25).toFixed(2);
    const y = (offY + py * dotPitch - 0.25).toFixed(2);
    const key = brIdx * TINT_STEPS + tIdx;
    const arr = buckets.get(key);
    // Inline width/height per rect — Figma / Illustrator import this reliably,
    // while a shared <style> selector gets dropped by some parsers.
    const rect = `<rect x="${x}" y="${y}" width="${dotSize.toFixed(2)}" height="${dotSize.toFixed(2)}"/>`;
    if (arr) arr.push(rect); else buckets.set(key, [rect]);
  }

  const groups = [];
  for (const [key, rects] of buckets) {
    const brIdx = Math.floor(key / TINT_STEPS);
    const tIdx = key % TINT_STEPS;
    const alpha = (brIdx / BR_STEPS).toFixed(3);
    groups.push(
      `<g fill="${tintColors[tIdx]}" opacity="${alpha}">${rects.join("")}</g>`
    );
  }

  const bgRect = bg !== "none"
    ? `<rect width="${size}" height="${size}" fill="${bg}"/>`
    : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    bgRect +
    groups.join("") +
    `</svg>`;

  writeFileSync(out, svg, "utf8");
  const dotsKept = [...buckets.values()].reduce((n, a) => n + a.length, 0);
  console.log(
    `wrote ${out} — ${dotsKept} dots in ${groups.length} color groups, ${(svg.length / 1024).toFixed(1)} KB`
  );
}

main();
