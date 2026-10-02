import { ArcHabit, ArcMonth } from './winter-arc.models';

/**
 * Static data for the Winter Arc beta UI. Nothing here comes from the API yet; when the backend
 * lands, the store reads real logs instead and this file goes away.
 */

export const ARC_SEASON_START = new Date(2026, 9, 1);
export const ARC_SEASON_END = new Date(2026, 11, 31);
export const ARC_SEASON_DAYS = 92;

/** Pinned mid-season so the beta screens have history to show. Swap for `new Date()` with real data. */
export const ARC_DEMO_TODAY = new Date(2026, 9, 23);

export const ARC_MONTHS: ArcMonth[] = [
  { month: 9, label: 'October' },
  { month: 10, label: 'November' },
  { month: 11, label: 'December' }
];

export const ARC_POINTS = { trained: 40, protein: 15, calories: 15, habits: 30 };
export const ARC_KEPT_THRESHOLD = 70;
export const ARC_FREEZES_PER_MONTH = 2;
export const ARC_EDITABLE_DAYS = 3;
export const ARC_MAX_HABITS = 10;

export const ARC_HABIT_SUGGESTIONS = [
  'No sugar', '3L water', 'Read 10 pages', 'Sleep by 11 pm', '10k steps',
  'No junk food', 'Stretch 10 min', 'Journal', 'No alcohol'
];

/** Stand-in for the member's existing daily routines. */
export const ARC_ROUTINE_SUGGESTIONS = ['Morning creatine', 'No phone after 10 pm'];

export const ARC_DEFAULT_HABITS: ArcHabit[] = [
  'No sugar', '3L water', 'Read 10 pages', 'Sleep by 11 pm', '10k steps', 'No phone after 10 pm'
].map((name, i) => ({ id: `h${i + 1}`, name }));

/** One sample frozen day so freezes show up in the UI. */
export const ARC_SAMPLE_FROZEN = ['2026-10-12'];

/** What today's automatic rows show. */
export const ARC_TODAY_DETAIL = {
  workout: 'Push day logged · 7:10 am',
  protein: { eaten: 96, target: 120 },
  calories: { eaten: 1980, target: 2100 }
};

/** Deterministic pseudo-random value in [0, 1) so the sample history is stable between reloads. */
export function arcSampleRandom(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
