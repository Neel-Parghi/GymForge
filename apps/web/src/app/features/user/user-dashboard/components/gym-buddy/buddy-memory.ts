const PREFIX = 'gf.buddy.';

/**
 * Tiny per-browser memory so the buddy reacts to each thing once (e.g. one "workout done" dance a day).
 * Purely a nicety: storage can be blocked or cleared, in which case it simply forgets.
 */
export function recall(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function remember(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Storage unavailable: the buddy just won't remember.
  }
}
