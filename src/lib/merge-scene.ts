// The drawing for "Five shop servers become one": five pale shop servers in a row, an arrow, then
// one server stack on its slab, lit in the accent. `old`, `unit` and `led--off` name the pieces
// for styling.
import type { IsoItem } from './iso';

// One step along the row moves +x and −y equally, which is straight across the screen.
const row = (t: number, z = 0): [number, number, number] => [t, -t, z];

const old: IsoItem[] = [0, 1, 2, 3, 4].flatMap((i): IsoItem[] => {
  const [x, y] = row(i * 1.25);
  return [
    { kind: 'box', at: [x, y, 0], size: [1, 1, 1.3], material: 'ice', part: 'old' },
    { kind: 'poly', points: [[x + 0.2, y + 1, 0.5], [x + 0.6, y + 1, 0.5], [x + 0.6, y + 1, 0.72], [x + 0.2, y + 1, 0.72]], part: 'led led--off' },
  ];
});

// Arrow from just past the last server towards the stack, at the servers' mid-height.
const [ax, ay, az] = row(6.4, 0.6);
const [bx, by] = row(7.9);
const arrow: IsoItem = {
  kind: 'line',
  points: [[ax, ay, az], [bx, by, az], [bx - 0.35, by + 0.35, az + 0.3], [bx, by, az], [bx - 0.35, by + 0.35, az - 0.3]],
  part: 'arrow',
};

const [sx, sy] = row(10.3);
const stack: IsoItem[] = [0, 1, 2].flatMap((k): IsoItem[] => {
  const z = 0.3 + k * 1.05;
  return [
    { kind: 'box', at: [sx, sy, z], size: [2, 2, 0.95], material: 'navy', part: 'unit' },
    { kind: 'poly', points: [[sx + 0.3, sy + 2, z + 0.33], [sx + 1.1, sy + 2, z + 0.33], [sx + 1.1, sy + 2, z + 0.6], [sx + 0.3, sy + 2, z + 0.6]], part: 'led' },
  ];
});

export const MERGE_SCENE = {
  width: 340,
  height: 104,
  pad: 4,
  items: [...old, arrow, { kind: 'box', at: [sx - 0.6, sy - 0.6, 0], size: [3.2, 3.2, 0.3], material: 'ice', part: 'plate' }, ...stack] as IsoItem[],
};
