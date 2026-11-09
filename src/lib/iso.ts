// Isometric drawing: boxes, flat shapes and lines placed in 3D, projected to 2D and scaled to fill
// an SVG box, square unless a width and height are given. Computed at build time, so the page
// ships plain polygons.

export type Point3 = readonly [number, number, number];
export type Material = 'navy' | 'ice' | 'orange';

export type IsoItem =
  | { kind: 'box'; at: Point3; size: Point3; material: Material; part?: string }
  | { kind: 'poly'; points: Point3[]; part: string }
  | { kind: 'line'; points: Point3[]; part: string };

export type IsoShape =
  | { kind: 'box'; material: Material; part?: string; faces: { side: 'l' | 'r' | 't'; points: string }[] }
  | { kind: 'poly' | 'line'; part: string; points: string };

const COS30 = Math.cos(Math.PI / 6);

/** +x runs right and down, +y left and down, +z straight up. */
export function project([x, y, z]: Point3): [number, number] {
  return [(x - y) * COS30, (x + y) / 2 - z];
}

/** The two sides a viewer sees (facing +y, then +x), then the top, so the top's edges stay crisp. */
function boxFaces({ at: [x, y, z], size: [w, d, h] }: { at: Point3; size: Point3 }) {
  const left: Point3[] = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
  const right: Point3[] = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
  const top: Point3[] = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
  return [['l', left], ['r', right], ['t', top]] as const;
}

type SceneBox = { size?: number; width?: number; height?: number; pad?: number };

/** Items are drawn in the order given, so list them back to front. */
export function isoScene(items: IsoItem[], { size = 220, width = size, height = size, pad = 18 }: SceneBox = {}): IsoShape[] {
  const all = items.flatMap((it) => (it.kind === 'box' ? boxFaces(it).flatMap(([, f]) => f) : it.points)).map(project);
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const scale = Math.min((width - 2 * pad) / (Math.max(...xs) - Math.min(...xs)), (height - 2 * pad) / (Math.max(...ys) - Math.min(...ys)));
  const ox = width / 2 - (scale * (Math.max(...xs) + Math.min(...xs))) / 2;
  const oy = height / 2 - (scale * (Math.max(...ys) + Math.min(...ys))) / 2;
  const toSvg = (pts: readonly Point3[]) =>
    pts
      .map(project)
      .map(([x, y]) => `${(ox + scale * x).toFixed(1)},${(oy + scale * y).toFixed(1)}`)
      .join(' ');

  return items.map((it): IsoShape => {
    if (it.kind === 'box') {
      return { kind: 'box', material: it.material, part: it.part, faces: boxFaces(it).map(([side, f]) => ({ side, points: toSvg(f) })) };
    }
    return { kind: it.kind, part: it.part, points: toSvg(it.points) };
  });
}
