import { expect, test } from 'vitest';
import { isoScene, project } from '../../src/lib/iso';
import { PROCESS_SCENES } from '../../src/lib/process-scenes';

const coords = (points: string) => points.split(' ').map((p) => p.split(',').map(Number));

test('projects x to the right and down, and z straight up', () => {
  const [x, y] = project([1, 0, 0]);
  expect(x).toBeCloseTo(Math.cos(Math.PI / 6));
  expect(y).toBeCloseTo(0.5);
  expect(project([0, 0, 1])).toEqual([0, -1]);
});

test('a box draws its two visible sides, then its top', () => {
  const [shape] = isoScene([{ kind: 'box', at: [0, 0, 0], size: [1, 1, 1], material: 'navy' }]);
  expect(shape.kind === 'box' && shape.faces.map((f) => f.side)).toEqual(['l', 'r', 't']);
});

test('there is one scene per step, in order', () => {
  expect(PROCESS_SCENES.map((s) => s.step)).toEqual(['audit', 'plan', 'launch', 'measure']);
});

test('every scene fills its box, centred, inside its padding', () => {
  for (const scene of PROCESS_SCENES) {
    const shapes = isoScene(scene.items, { pad: scene.pad });
    const points = shapes.flatMap((s) => (s.kind === 'box' ? s.faces.flatMap((f) => coords(f.points)) : coords(s.points)));
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    for (const axis of [xs, ys]) {
      expect(Math.min(...axis), scene.step).toBeGreaterThanOrEqual(scene.pad - 0.1);
      expect(Math.max(...axis), scene.step).toBeLessThanOrEqual(220 - scene.pad + 0.1);
      expect((Math.min(...axis) + Math.max(...axis)) / 2, scene.step).toBeCloseTo(110, 0);
    }
  }
});

test('a scene can fill a wide box, centred inside its padding', () => {
  const shapes = isoScene([{ kind: 'box', at: [0, 0, 0], size: [4, 0.5, 0.5], material: 'navy' }], { width: 340, height: 100, pad: 6 });
  const points = shapes.flatMap((s) => (s.kind === 'box' ? s.faces.flatMap((f) => coords(f.points)) : coords(s.points)));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  expect(Math.min(...xs)).toBeGreaterThanOrEqual(5.9);
  expect(Math.max(...xs)).toBeLessThanOrEqual(334.1);
  expect(Math.min(...ys)).toBeGreaterThanOrEqual(5.9);
  expect(Math.max(...ys)).toBeLessThanOrEqual(94.1);
  expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(170, 0);
  expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(50, 0);
});

test('the merge drawing: five unlit shop servers, an arrow, then one lit stack of three', async () => {
  const { MERGE_SCENE } = await import('../../src/lib/merge-scene');
  const parts = MERGE_SCENE.items.map((it) => it.part ?? '');
  expect(parts.filter((p) => p.split(' ').includes('old'))).toHaveLength(5);
  expect(parts.filter((p) => p.split(' ').includes('unit'))).toHaveLength(3);
  expect(parts.filter((p) => p === 'led led--off')).toHaveLength(5);
  expect(parts.filter((p) => p === 'led')).toHaveLength(3);
  expect(parts).toContain('arrow');
  expect(parts).toContain('plate');
});
