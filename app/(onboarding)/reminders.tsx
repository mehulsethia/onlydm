import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatedHeadline } from '@/components/AnimatedHeadline';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { ReminderTimeRow } from '@/components/ReminderTimeRow';
import { Screen } from '@/components/Screen';
import { FEATURES } from '@/config/features';
import { disableReminders, enableReminders } from '@/notifications/reminders';
import { nudgeTime } from '@/notifications/reminderPlan';
import { progressFor } from '@/state/onboardingSteps';
import { markOnboardingComplete } from '@/state/progress';
import { readReminders, saveReminderTimes } from '@/state/reminders';
import { spacing } from '@/theme/tokens';

/** Asks everyone, before the paywall, whether they want the two daily nudges. */
export default function Reminders() {
  const router = useRouter();
  const [times, setTimes] = useState(() => readReminders().times);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nudge = (index: 0 | 1, delta: number) => {
    const next = nudgeTime(times, index, delta);
    if (next === times) return setNote('Keep the two reminders at least 8 hours apart.');
    setNote(null);
    saveReminderTimes(next);
    setTimes(next);
  };

  const next = () => {
    if (FEATURES.paywall) {
      router.push('/paywall');
    } else {
      markOnboardingComplete();
      router.replace('/(main)/inbox');
    }
  };

  const turnOn = async () => {
    setBusy(true);
    await enableReminders();
    setBusy(false);
    next();
  };
  const notNow = async () => {
    await disableReminders();
    next();
  };

  return (
    <Screen
      progress={progressFor('reminders')}
      paneFirst={false}
      centred
      pane={
        <View style={{ gap: spacing.md }}>
          <GlassCard style={{ padding: 0 }}>
            <ReminderTimeRow label="Morning check-in" minutes={times[0]} onNudge={(d) => nudge(0, d)} />
            <ReminderTimeRow label="Evening check-in" minutes={times[1]} onNudge={(d) => nudge(1, d)} last />
          </GlassCard>
          {note ? <AppText variant="small" muted center accessibilityLiveRegion="polite">{note}</AppText> : null}
          <AppText variant="small" muted center>You can change these any time in Settings.</AppText>
        </View>
      }
      footer={
        <>
          <Button label="Turn on reminders" onPress={turnOn} disabled={busy} />
          <Button label="Not now" variant="secondary" onPress={notNow} disabled={busy} />
        </>
      }
    >
      <AnimatedHeadline>We can&apos;t see your messages. So we&apos;ll remind you.</AnimatedHeadline>
    </Screen>
  );
}
