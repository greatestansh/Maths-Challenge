import { formatSize, type Size } from './twoadic.mjs';

export const displayInteger = (value: bigint) => value.toString().replace('-', '−');

export function sizeTex(size: Size) {
  const [numerator, denominator] = formatSize(size).split('/');
  return denominator ? `\\frac{${numerator}}{${denominator}}` : numerator;
}
