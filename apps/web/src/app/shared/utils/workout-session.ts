import { CONSTANTS } from '../../core/constants/constants';

const TRACK = CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE;

/** Upper bounds a logged set may hold (kg or km for weight, reps or minutes for reps). */
export const SET_LIMITS = { weight: 300, reps: 100 };

/** Guesses whether an exercise is cardio from its name, or from its target text (e.g. "20 mins"). */
export function isCardioExercise(name: string, target?: string): boolean {
  if (!name) return false;
  const nameLower = name.toLowerCase().trim();

  if (TRACK.CARDIO_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return true;
  }

  if (TRACK.CARDIO_NAME_REGEXP.test(nameLower)) {
    return !nameLower.includes('farmer');
  }

  return !!target && TRACK.CARDIO_TARGET_REGEXP.test(target.toLowerCase().trim());
}

/** Clamps a logged value into [0, max]; empty input stays null. */
export function clampSetValue(value: number | null | undefined, max: number): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.min(Math.max(value, 0), max);
}
