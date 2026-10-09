/** Rounds to at most 2 decimals so float noise (e.g. 123.99999999) never reaches the UI. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
