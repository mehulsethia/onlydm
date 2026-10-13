import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { readProgress } from '@/state/progress';
import { readReminders, saveRemindersEnabled } from '@/state/reminders';
import { reminderCopy } from './reminderPlan';

/**
 * Two daily "check your DMs" nudges. Local notifications scheduled on the phone: OnlyDM never reads messages,
 * so there is nothing to push from a server. They repeat every day and fire offline.
 */
const IDS = ['daily-reminder-1', 'daily-reminder-2'] as const;
const CHANNEL_ID = 'reminders';

export async function cancelReminders() {
  await Promise.all(IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

const dayNumber = () => Math.floor(Date.now() / 86_400_000);

/** Makes the schedule match the saved settings. Never asks for permission; safe to call on every launch. */
export async function syncReminders(): Promise<void> {
  try {
    const { enabled, times } = readReminders();
    const p = readProgress();
    if (!enabled || !p.onboardingComplete) return cancelReminders();
    if (!(await Notifications.getPermissionsAsync()).granted) return cancelReminders();
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT });
    }
    await cancelReminders();
    const day = dayNumber();
    await Promise.all(
      ([0, 1] as const).map((slot) => {
        const { title, body } = reminderCopy(slot, p.talkingMinutes, day);
        return Notifications.scheduleNotificationAsync({
          identifier: IDS[slot],
          content: { title, body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: Math.floor(times[slot] / 60),
            minute: times[slot] % 60,
            channelId: CHANNEL_ID,
          },
        });
      }),
    );
  } catch {}
}

/** Turns reminders on, asking for permission if needed. False when the user has notifications blocked. */
export async function enableReminders(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
    saveRemindersEnabled(granted);
    await syncReminders();
    return granted;
  } catch {
    return false;
  }
}

export async function disableReminders() {
  saveRemindersEnabled(false);
  await cancelReminders();
}
