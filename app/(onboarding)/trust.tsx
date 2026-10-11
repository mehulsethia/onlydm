import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatedHeadline } from '@/components/AnimatedHeadline';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ExitIcon, NoServerIcon, PageIcon } from '@/components/Icons';
import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import type { PlatformId } from '@/rules/types';
import { progressFor } from '@/state/onboardingSteps';
import { PLATFORM_META, PRIMARY_PLATFORM } from '@/state/platformMeta';
import { isSignedInTo } from '@/state/platforms';
import { colors, spacing } from '@/theme/tokens';

const ROWS = [
  { Icon: PageIcon, text: 'Their sign-in page, not ours' },
  { Icon: NoServerIcon, text: 'Nothing is stored on our servers' },
  { Icon: ExitIcon, text: 'Sign out any time in Settings' },
];

/** Onboarding signs in to Instagram only. Threads and Facebook are optional, from Settings. */
export default function Trust() {
  const router = useRouter();
  const { signedIn } = useLocalSearchParams<{ signedIn?: PlatformId }>();
  const [connected, setConnected] = useState(() => isSignedInTo(PRIMARY_PLATFORM));
  const advanced = useRef(false);

  useFocusEffect(useCallback(() => setConnected(isSignedInTo(PRIMARY_PLATFORM)), []));

  // Just signed in: go straight on to the reveal.
  useEffect(() => {
    if (signedIn && connected && !advanced.current) {
      advanced.current = true;
      router.push('/(onboarding)/reveal');
    }
  }, [signedIn, connected, router]);

  const { label, domain } = PLATFORM_META[PRIMARY_PLATFORM];
  const signIn = () => router.push({ pathname: '/(onboarding)/login', params: { platform: PRIMARY_PLATFORM } });
  const next = () => router.push('/(onboarding)/reveal');

  return (
    <Screen
      centred
      progress={progressFor('trust')}
      paneFirst={false}
      pane={
        <GlassCard style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
          {ROWS.map(({ Icon, text }) => (
            <View key={text} accessible accessibilityLabel={text} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.lightSurface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon color={colors.primaryOnDark} />
              </View>
              <AppText style={{ flex: 1 }}>{text}</AppText>
            </View>
          ))}
        </GlassCard>
      }
      footer={connected ? <Button label="Next" onPress={next} /> : <Button label={`Sign in on ${domain}`} onPress={signIn} />}
    >
      <View style={{ gap: spacing.lg }}>
        <AnimatedHeadline>{`You sign in on ${label}'s own page.`}</AnimatedHeadline>
        <AppText muted>OnlyDM never sees your password or your messages.</AppText>
      </View>
    </Screen>
  );
}
