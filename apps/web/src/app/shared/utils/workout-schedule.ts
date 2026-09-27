import { SchedulableDay } from '../models/workout-plan.model';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/** Number of sets an exercise contributes (plans store sets as a number or numeric string; 3 when unset). */
export function exerciseSetCount(sets: number | string | undefined): number {
  return typeof sets === 'number' ? sets : parseInt(sets ?? '', 10) || 3;
}

/** Formats a date as YYYY-MM-DD in local time (avoids UTC offset shifting the day). */
export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Picks the plan day scheduled for a given date.
 * Weekly plans match on the weekday in the day name; abstract splits (Day 1, Day 2…)
 * fall on Monday / Wednesday / Friday. Returns null when nothing is scheduled (rest).
 */
export function resolveScheduledDay<T extends SchedulableDay>(days: T[], date: Date): T | null {
  if (!days || days.length === 0) return null;

  const weekday = WEEKDAY_NAMES[date.getDay()];
  const weekdayMatch = days.find(d => d.dayName && d.dayName.toLowerCase().includes(weekday.toLowerCase()));
  if (weekdayMatch) return weekdayMatch;

  const isAbstractSplit = !days.some(d =>
    WEEKDAY_NAMES.some(w => (d.dayName || '').toLowerCase().includes(w.toLowerCase()))
  );
  if (!isAbstractSplit) return null;

  if (weekday === 'Monday') return days[0];
  if (weekday === 'Wednesday' && days.length > 1) return days[1];
  if (weekday === 'Friday' && days.length > 2) return days[2];
  return null;
}
