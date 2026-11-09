import { expect, test } from 'vitest';
import { readDist } from './dist';

const CSP =
  "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self' https://status.paperbase.me; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

test('the CSP is the one in the spec', () => {
  expect(readDist('_headers')).toContain(CSP);
});
