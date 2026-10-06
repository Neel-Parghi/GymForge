import { ExerciseProgressPointDto, ProgressSetDto } from '../models/workout-progress.model';

export type ChangeDir = 'up' | 'down' | 'same';

export interface ProgressChange {
  label: string;
  dir: ChangeDir;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function formatWeight(weight: number): string {
  return weight > 0 ? `${round1(weight)}` : 'BW';
}

export function formatSet(set: ProgressSetDto): string {
  return `${formatWeight(set.weight)} × ${set.reps}`;
}

export function formatVolume(volume: number): string {
  return Math.round(volume).toLocaleString('en-US');
}

export function compareSets(current: ProgressSetDto, previous: ProgressSetDto | undefined): ProgressChange {
  if (!previous) return { label: 'New set', dir: 'same' };
  const kg = round1(current.weight - previous.weight);
  if (kg !== 0) return { label: `${kg > 0 ? '↑' : '↓'} ${Math.abs(kg)} kg`, dir: kg > 0 ? 'up' : 'down' };
  const reps = current.reps - previous.reps;
  if (reps !== 0) return { label: `${reps > 0 ? '↑' : '↓'} ${plural(Math.abs(reps), 'rep')}`, dir: reps > 0 ? 'up' : 'down' };
  return { label: '= Same', dir: 'same' };
}

export function compareSessions(current: ExerciseProgressPointDto, previous: ExerciseProgressPointDto | null): ProgressChange | null {
  if (!previous) return null;
  const kg = round1(current.topWeight - previous.topWeight);
  if (kg !== 0) return { label: `${kg > 0 ? '↑' : '↓'} ${Math.abs(kg)} kg`, dir: kg > 0 ? 'up' : 'down' };
  const reps = current.totalReps - previous.totalReps;
  if (reps !== 0) return { label: `${reps > 0 ? '↑' : '↓'} ${plural(Math.abs(reps), 'rep')}`, dir: reps > 0 ? 'up' : 'down' };
  return { label: '= Same', dir: 'same' };
}

export function changeDir(current: number, previous: number | null | undefined): ChangeDir {
  if (previous === null || previous === undefined || current === previous) return 'same';
  return current > previous ? 'up' : 'down';
}

export function sparklinePoints(values: number[], width: number, height: number, pad = 3): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = (width - pad * 2) / (values.length - 1);
  return values
    .map((v, i) => `${(pad + i * step).toFixed(1)},${(height - pad - ((v - min) / span) * (height - pad * 2)).toFixed(1)}`)
    .join(' ');
}

export function trendDir(values: number[]): ChangeDir {
  return values.length < 2 ? 'same' : changeDir(values[values.length - 1], values[0]);
}
