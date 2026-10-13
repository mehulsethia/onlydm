import { Pressable, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { formatClock, TIME_STEP } from '@/notifications/reminderPlan';
import { colors, radius, sizes, spacing } from '@/theme/tokens';

/** A time of day with 30-minute steps, used in onboarding and Settings. */
export function ReminderTimeRow({ label, minutes, onNudge, last }: { label: string; minutes: number; onNudge: (delta: number) => void; last?: boolean }) {
  const step = (sign: 1 | -1, text: string, name: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${label}`}
      onPress={() => onNudge(sign * TIME_STEP)}
      hitSlop={4}
      style={({ pressed }) => ({ width: sizes.touch, height: sizes.touch, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.text, opacity: pressed ? 0.6 : 1 })}
    >
      <AppText variant="bodyMedium">{text}</AppText>
    </Pressable>
  );
  return (
    <View style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.hairline }}>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium">{label}</AppText>
        <AppText variant="small" muted style={{ fontVariant: ['tabular-nums'] }}>{formatClock(minutes)}</AppText>
      </View>
      {step(-1, '−', 'Earlier')}
      {step(1, '+', 'Later')}
    </View>
  );
}
