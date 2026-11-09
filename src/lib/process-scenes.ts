// The four How I work drawings, as isometric scenes. `part` names the classes that colour and
// animate each piece: `rise rN` settles in Nth, `grow gN` grows Nth, `lift` hovers.
import type { IsoItem } from './iso';

export type ProcessScene = { step: 'audit' | 'plan' | 'launch' | 'measure'; pad: number; items: IsoItem[]; lens?: true };

const servers: IsoItem[] = [0, 1, 2].flatMap((k): IsoItem[] => {
  const z = 0.35 + k * 1.05;
  return [
    { kind: 'box', at: [0, 0, z], size: [3, 2.2, 0.9], material: 'navy', part: `rise r${k}` },
    {
      kind: 'poly',
      points: [[0.3, 2.2, z + 0.32], [1.1, 2.2, z + 0.32], [1.1, 2.2, z + 0.58], [0.3, 2.2, z + 0.58]],
      part: `${k === 1 ? 'led led--alert' : 'led'} rise r${k}`,
    },
  ];
});

export const PROCESS_SCENES: ProcessScene[] = [
  {
    // A server stack on its slab, under the lens.
    step: 'audit',
    pad: 26,
    lens: true,
    items: [{ kind: 'box', at: [-0.6, -0.6, 0], size: [4.2, 3.4, 0.35], material: 'ice' }, ...servers],
  },
  {
    // Steps climbing to a flag.
    step: 'plan',
    pad: 18,
    items: [
      { kind: 'box', at: [0, 0, 0], size: [6.2, 2.4, 0.4], material: 'ice' },
      { kind: 'box', at: [0.3, 0.4, 0.4], size: [1.6, 1.6, 0.8], material: 'navy', part: 'rise r0' },
      { kind: 'box', at: [2.3, 0.4, 0.4], size: [1.6, 1.6, 1.6], material: 'navy', part: 'rise r1' },
      { kind: 'box', at: [4.3, 0.4, 0.4], size: [1.6, 1.6, 2.4], material: 'navy', part: 'rise r2' },
      { kind: 'line', points: [[5.1, 1.2, 2.8], [5.1, 1.2, 4.7]], part: 'pole rise r3' },
      { kind: 'poly', points: [[5.1, 1.2, 4.7], [5.1, -0.2, 4.35], [5.1, 1.2, 4.0]], part: 'flag rise r3' },
    ],
  },
  {
    // A release lifting off its pad.
    step: 'launch',
    pad: 22,
    items: [
      { kind: 'box', at: [0, 0, 0], size: [4, 4, 0.5], material: 'ice' },
      { kind: 'poly', points: [[1.2, 1.2, 0.5], [2.8, 1.2, 0.5], [2.8, 2.8, 0.5], [1.2, 2.8, 0.5]], part: 'shadow' },
      { kind: 'line', points: [[1.3, 3, 1], [1.3, 3, 2]], part: 'trail' },
      { kind: 'line', points: [[3, 1.3, 1], [3, 1.3, 2]], part: 'trail' },
      { kind: 'line', points: [[2.4, 3.1, 0.8], [2.4, 3.1, 1.7]], part: 'trail' },
      { kind: 'box', at: [1, 1, 2.6], size: [2, 2, 2], material: 'orange', part: 'lift' },
    ],
  },
  {
    // Bars rising, the newest in orange.
    step: 'measure',
    pad: 18,
    items: [
      { kind: 'box', at: [0, 0, 0], size: [7.4, 2.6, 0.45], material: 'ice' },
      ...[1.3, 2.2, 3.1, 4.3].map(
        (h, k): IsoItem => ({ kind: 'box', at: [0.5 + k * 1.75, 0.65, 0.45], size: [1.2, 1.3, h], material: k === 3 ? 'orange' : 'navy', part: `grow g${k}` }),
      ),
    ],
  },
];
