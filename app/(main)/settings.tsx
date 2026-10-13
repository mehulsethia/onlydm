import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { ChevronIcon } from '@/components/Icons';
import { OnlyDMMark } from '@/components/OnlyDMMark';
import { Wordmark } from '@/components/Wordmark';
import { Screen } from '@/components/Screen';
import { CONTACT_EMAIL, CONTACT_URL } from '@/config/links';
import type { LegalDocId } from '@/legal/content';
import { cancelReminders, disableReminders, enableReminders, syncReminders } from '@/notifications/reminders';
import { nudgeTime } from '@/notifications/reminderPlan';
import { ReminderTimeRow } from '@/components/ReminderTimeRow';
import { readReminders, saveReminderTimes } from '@/state/reminders';
import { cancelTrialReminder } from '@/notifications/trialReminder';
import { formatDate, MANAGE_SUBSCRIPTIONS_URL } from '@/purchases';
import { usePayments } from '@/purchases/PaymentsProvider';
import { getActivePack } from '@/rules/store';
import { EXTRA_PLATFORMS, platformLabel, PRIMARY_PLATFORM } from '@/state/platformMeta';
import { disconnectPlatform } from '@/state/disconnect';
import { connectedPlatforms } from '@/state/platforms';
import type { PlatformId } from '@/rules/types';
import { clearProgress } from '@/state/progress';
import { emitWebEvent } from '@/state/webEvents';
import { colors, fonts, radius, sizes, spacing, type ColorName } from '@/theme/tokens';

function Row({
  label,
  detail,
  onPress,
  disabled,
  tone,
  last,
  action,
}: {
  label: string;
  detail?: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: ColorName;
  last?: boolean;
  /** A small outlined button on the right, e.g. Disconnect. */
  action?: { label: string; onPress: () => void; accessibilityLabel: string };
}) {
  const actionable = !!onPress && !disabled;
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.hairline,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyMedium" tone={tone}>{label}</AppText>
        {detail ? <AppText variant="small" muted>{detail}</AppText> : null}
      </View>
      {actionable && <ChevronIcon color={colors.textMuted} />}
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          onPress={action.onPress}
          hitSlop={6}
          style={({ pressed }) => ({
            minHeight: 36,
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.text,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <AppText variant="small" style={{ fontFamily: fonts.bodySemi }}>{action.label}</AppText>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" muted accessibilityRole="header">{title}</AppText>
      <View style={{ backgroundColor: colors.glassFill, borderRadius: radius.card, borderWidth: 1, borderColor: colors.glassBorder, borderTopColor: colors.glassEdge, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { mode, customer, restore, busy, getSupportId } = usePayments();
  const pack = getActivePack();
  const [note, setNote] = useState<string | null>(null);
  const [supportId, setSupportId] = useState<string | null>(null);
  useEffect(() => {
    getSupportId().then(setSupportId);
  }, [getSupportId]);
  const [connected, setConnected] = useState(connectedPlatforms);
  useFocusEffect(useCallback(() => setConnected(connectedPlatforms()), []));

  const [reminders, setReminders] = useState(readReminders);
  const [reminderNote, setReminderNote] = useState<string | null>(null);
  const toggleReminders = async () => {
    if (reminders.enabled) {
      await disableReminders();
      setReminderNote(null);
    } else {
      const ok = await enableReminders();
      setReminderNote(ok ? null : 'Notifications are off for OnlyDM. Turn them on in iOS Settings, then try again.');
    }
    setReminders(readReminders());
  };
  const nudge = (index: 0 | 1, delta: number) => {
    const next = nudgeTime(reminders.times, index, delta);
    if (next === reminders.times) return setReminderNote('Keep the two reminders at least 8 hours apart.');
    setReminderNote(null);
    saveReminderTimes(next);
    setReminders(readReminders());
    void syncReminders();
  };

  const status = (() => {
    if (!customer.isPro) return 'Not subscribed';
    if (customer.lifetime) return 'Lifetime access';
    const when = customer.expiresAt ? formatDate(new Date(customer.expiresAt)) : null;
    if (customer.inTrial) return when ? `Free trial, ends ${when}` : 'Free trial';
    if (when) return customer.willRenew ? `Active, renews ${when}` : `Active, ends ${when}`;
    return 'Active';
  })();

  const doRestore = async () => setNote((await restore()) ? 'Subscription restored.' : 'No active subscription found.');

  const disconnect = (id: PlatformId) => {
    const name = platformLabel(id);
    Alert.alert(
      `Disconnect ${name}?`,
      `This signs you out of ${name} inside OnlyDM and removes its sign-in from this phone. Your other accounts stay connected, and your ${name} account itself isn't affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectPlatform(id);
            setConnected(connectedPlatforms());
          },
        },
      ],
    );
  };

  const accountRow = (id: PlatformId, last: boolean) => {
    const name = platformLabel(id);
    const on = connected.includes(id);
    return (
      <Row
        key={id}
        label={on ? name : `Connect ${name}`}
        detail={on ? 'Connected' : 'Sign in on its own page'}
        onPress={on ? undefined : () => router.push({ pathname: '/(onboarding)/login', params: { platform: id } })}
        action={on ? { label: 'Disconnect', onPress: () => disconnect(id), accessibilityLabel: `Disconnect ${name}` } : undefined}
        last={last}
      />
    );
  };

  const signOut = () =>
    Alert.alert(
      'Sign out of everything?',
      'This disconnects Instagram and any other accounts you added, clears your OnlyDM answers from this phone and starts OnlyDM from the beginning. Your subscription is not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out of everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await CookieManager.clearAll(true);
            } catch {}
            emitWebEvent('clear');
            clearProgress();
            cancelTrialReminder();
            cancelReminders();
            router.dismissAll();
            router.replace('/');
          },
        },
      ],
    );

  const open = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  const openDoc = (doc: LegalDocId) => router.push({ pathname: '/legal/[doc]', params: { doc } });

  return (
    <Screen>
      <View style={{ gap: spacing.xl, paddingBottom: spacing.xl }}>
        <AppText variant="title">Settings</AppText>

        <Section title="Subscription">
          <Row label="Status" detail={status} />
          {!customer.isPro || mode === 'dev' ? <Row label="Plans and pricing" detail="Monthly, yearly or lifetime. 7 days free on yearly" onPress={() => router.push('/paywall')} /> : null}
          <Row label="Restore purchases" onPress={doRestore} disabled={busy || mode === 'dev'} />
          <Row label="Manage subscription" onPress={() => open(MANAGE_SUBSCRIPTIONS_URL)} disabled={mode === 'dev'} />
          <Row label="Cancel anytime · How to cancel" onPress={() => openDoc('cancel')} last={!note} />
          {note && (
            <AppText variant="small" muted accessibilityLiveRegion="polite" style={{ padding: spacing.md }}>
              {note}
            </AppText>
          )}
        </Section>

        <Section title="Reminders">
          <Row label="Daily reminders" detail={reminders.enabled ? 'On. We nudge you twice a day to check your DMs.' : 'Off'} onPress={toggleReminders} last={!reminders.enabled && !reminderNote} />
          {reminders.enabled ? (
            <>
              <ReminderTimeRow label="First reminder" minutes={reminders.times[0]} onNudge={(d) => nudge(0, d)} />
              <ReminderTimeRow label="Second reminder" minutes={reminders.times[1]} onNudge={(d) => nudge(1, d)} last={!reminderNote} />
            </>
          ) : null}
          {reminderNote ? (
            <View style={{ padding: spacing.md }}>
              <AppText variant="small" muted accessibilityLiveRegion="polite">{reminderNote}</AppText>
            </View>
          ) : null}
        </Section>

        <Section title="Instagram">
          {accountRow(PRIMARY_PLATFORM, true)}
        </Section>

        <Section title="More accounts (optional)">
          {EXTRA_PLATFORMS.map((id, i) => accountRow(id, i === EXTRA_PLATFORMS.length - 1))}
        </Section>

        <Section title="Show">
          <Row label="Reload current page" onPress={() => { emitWebEvent('reload'); router.back(); }} />
          <Row label="Sign out of everything" detail="Disconnects all accounts and starts over" tone="removedOnDark" onPress={signOut} last />
        </Section>

        <Section title="Privacy, terms and contact">
          <AppText variant="small" style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
            OnlyDM shows each app's own website. You sign in on their page, and OnlyDM never reads, stores or sends your password, cookies or
            messages. It has no analytics. The only things stored on this device are your onboarding answers and which accounts you're signed in to.
          </AppText>
          <Row label="Privacy Policy" onPress={() => openDoc('privacy')} />
          <Row label="Terms of Use" onPress={() => openDoc('terms')} />
          <Row label="Contact" detail={CONTACT_EMAIL} onPress={() => Linking.openURL(supportId ? `${CONTACT_URL}&body=${encodeURIComponent(`\n\n---\nSupport ID: ${supportId}\nVersion: ${Constants.expoConfig?.version ?? ''}`)}` : CONTACT_URL).catch(() => {})} last />
        </Section>

        <Section title="About">
          <View accessible style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
            <OnlyDMMark size={sizes.touch} />
            <View style={{ gap: 2 }}>
              <Wordmark variant="heading" />
              <AppText variant="small" muted>Only DMs, zero distractions.</AppText>
            </View>
          </View>
          <Row label="Version" detail={Constants.expoConfig?.version ?? '1.0.0'} />
          {supportId ? <Row label="Support ID" detail={supportId} /> : null}
          <Row label="Rules pack" detail={`v${pack.version}`} />
          <AppText variant="small" muted style={{ padding: spacing.md }}>
            Not affiliated with Meta.
          </AppText>
        </Section>
      </View>
    </Screen>
  );
}
