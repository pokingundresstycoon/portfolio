/** The characters a split-flap tile turns through on its way to a letter. */
export const FLAP_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** The letters one tile shows as it rolls into place: `steps` in all, ending on `target`. A blank
 * tile doesn't roll. */
export function rollSequence(target: string, steps: number, random: () => number = Math.random): string[] {
  if (target.trim() === '') return [target];
  const seq: string[] = [];
  for (let i = 0; i < steps - 1; i++) seq.push(FLAP_ALPHABET[Math.floor(random() * FLAP_ALPHABET.length)]);
  seq.push(target);
  return seq;
}
