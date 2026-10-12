import { DEFAULT_TIMES, sanitiseTimes } from '@/notifications/reminderPlan';
import { storage } from './storage';

/** Local reminder preferences. `enabled` is null until the user has been asked once. */
const KEYS = { enabled: 'remindersEnabled', times: 'reminderTimes' } as const;

export function readReminders(): { enabled: boolean | null; times: [number, number] } {
  let times: [number, number] = DEFAULT_TIMES;
  try {
    const raw = storage.getString(KEYS.times);
    if (raw) times = sanitiseTimes(JSON.parse(raw));
  } catch {}
  return { enabled: storage.getBoolean(KEYS.enabled) ?? null, times };
}

export const saveRemindersEnabled = (on: boolean) => storage.set(KEYS.enabled, on);
export const saveReminderTimes = (times: [number, number]) => storage.set(KEYS.times, JSON.stringify(times));
