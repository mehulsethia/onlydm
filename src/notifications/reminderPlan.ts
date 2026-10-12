import { formatDuration } from '@/onboarding/maths';

/** Pure maths and copy for the two daily reminders. Times are minutes after local midnight. */

export const DEFAULT_TIMES: [number, number] = [9 * 60, 21 * 60];
/** The two reminders are never closer than this, either way round the clock. */
export const MIN_GAP = 8 * 60;
export const TIME_STEP = 30;
const DAY = 24 * 60;

/** Gap between two times of day, going the short way round. */
export const gapBetween = (a: number, b: number) => {
  const d = Math.abs(a - b) % DAY;
  return Math.min(d, DAY - d);
};

const wrap = (m: number) => ((m % DAY) + DAY) % DAY;

/** A stored pair, or the defaults when it is missing, malformed or too close together. */
export function sanitiseTimes(raw: unknown): [number, number] {
  if (!Array.isArray(raw) || raw.length !== 2) return DEFAULT_TIMES;
  const [a, b] = raw;
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < DAY;
  if (!ok(a) || !ok(b) || gapBetween(a, b) < MIN_GAP) return DEFAULT_TIMES;
  return [a, b];
}

/** Moves one reminder by `delta` minutes (wrapping past midnight). A move that would break the gap is ignored. */
export function nudgeTime(times: [number, number], index: 0 | 1, delta: number): [number, number] {
  const next: [number, number] = [times[0], times[1]];
  next[index] = wrap(next[index] + delta);
  return gapBetween(next[0], next[1]) >= MIN_GAP ? next : times;
}

/** "9:00 AM", "9:30 PM". */
export function formatClock(minutes: number): string {
  const m = wrap(minutes);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

const MORNING = [
  'Anyone waiting in your DMs? Check in, then get on with your day.',
  'Your messages are not going anywhere. Go and reply to the people who matter.',
  'A quick look at your DMs, nothing else. Skip the feed.',
];
const EVENING = [
  'Before bed: reply to whoever is waiting, then put the phone down.',
  'Anyone you owe a reply to? Do it now, without the feed.',
  'Close out your DMs for the day. The feed can wait.',
];

/** Copy for a reminder slot. The line rotates by day, and it names the user's own talking time when they set one. */
export function reminderCopy(slot: 0 | 1, talkingMinutes: number | null, dayNumber: number): { title: string; body: string } {
  const lines = slot === 0 ? MORNING : EVENING;
  const line = lines[Math.abs(dayNumber + slot) % lines.length];
  const body = talkingMinutes && talkingMinutes > 0 && dayNumber % 2 === 0
    ? `You said ${formatDuration(talkingMinutes)} a day goes on real conversations. ${line}`
    : line;
  return { title: 'OnlyDM', body };
}
