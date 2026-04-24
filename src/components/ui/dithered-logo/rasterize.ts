export type Point = [number, number];

/**
 * Rasterize an SVG path `d` string into a list of integer [x, y] grid cells
 * on a `size × size` grid. Uses an offscreen canvas + Path2D.
 */
export function rasterizePath(
  d: string | string[],
  size = 205,
  opts: {
    viewBox?: number | [number, number];
    fillRule?: CanvasFillRule;
    padding?: number;
  } = {}
): Point[] {
  const { viewBox = 100, fillRule = "nonzero", padding = 0.08 } = opts;
  const [vbw, vbh] = Array.isArray(viewBox) ? viewBox : [viewBox, viewBox];

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement("canvas"), { width: size, height: size });
  const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  const fit = (size * (1 - padding * 2)) / Math.max(vbw, vbh);
  const drawW = vbw * fit;
  const drawH = vbh * fit;
  ctx.setTransform(fit, 0, 0, fit, (size - drawW) / 2, (size - drawH) / 2);

  ctx.fillStyle = "#000";
  const paths = Array.isArray(d) ? d : [d];
  for (const p of paths) ctx.fill(new Path2D(p), fillRule);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const { data } = ctx.getImageData(0, 0, size, size);
  const pts: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 127) pts.push([x, y]);
    }
  }
  return pts;
}

/**
 * Rasterize rendered text — handy for logomarks of typographic shapes.
 */
export function rasterizeText(
  text: string,
  size = 205,
  opts: { font?: string; weight?: number | string } = {}
): Point[] {
  const { font = "ui-sans-serif, system-ui, sans-serif", weight = 800 } = opts;
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(size, size)
      : Object.assign(document.createElement("canvas"), { width: size, height: size });
  const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${Math.round(size * 0.85)}px ${font}`;
  ctx.fillText(text, size / 2, size / 2);
  const { data } = ctx.getImageData(0, 0, size, size);
  const pts: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 127) pts.push([x, y]);
    }
  }
  return pts;
}
