import { useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { formatReadout, snap, spokenDuration } from '@/onboarding/maths';
import { tick } from '@/motion/haptics';
import { colors, sizes, spacing, typeScale } from '@/theme/tokens';
import { useLayout } from '@/theme/useLayout';
import { AppText } from '../AppText';
import { RollingNumber } from '../RollingNumber';

interface Props {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (minutes: number) => void;
}

const THUMB = 28;
const TRACK = 4;

/** Large mono readout over a wide slider. Light haptic on each step; adjustable for screen readers. */
export function DurationSlider({ label, min, max, step, value, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const { contentWidth, spread } = useLayout();
  // Fit the longest readout ("12 h 00 min", 11 mono characters) to the column.
  const column = (spread ? (contentWidth - sizes.gutter * 2 - spacing.xxl) / 2 : contentWidth - sizes.gutter * 2);
  const readoutSize = Math.max(28, Math.min(typeScale.readout.fontSize, Math.floor(column / (11 * 0.62))));
  const last = useRef(value);
  const span = Math.max(step, max - min);
  const ratio = Math.min(1, Math.max(0, (value - min) / span));

  // The thumb follows the finger continuously; only the readout (and haptic) move in steps. After release it settles on the step.
  const reduce = useReducedMotion();
  const pos = useSharedValue(ratio);
  const dragging = useRef(false);
  useEffect(() => {
    if (!dragging.current) pos.value = reduce ? ratio : withTiming(ratio, { duration: 160, easing: Easing.out(Easing.cubic) });
  }, [ratio, reduce, pos]);
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: pos.value * Math.max(0, width - THUMB) }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${pos.value * 100}%` }));

  const set = (next: number) => {
    const v = snap(next, step, min, max);
    if (v === last.current) return;
    last.current = v;
    tick();
    onChange(v);
  };
  const fromX = (x: number) => {
    if (width <= 0) return;
    const usable = Math.max(1, width - THUMB);
    const raw = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    dragging.current = true;
    pos.value = raw;
    set(min + raw * span);
  };
  const settle = () => {
    dragging.current = false;
    pos.value = withTiming(ratio, { duration: 140, easing: Easing.out(Easing.cubic) });
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => fromX(e.x))
    .onUpdate((e) => fromX(e.x))
    .onFinalize(settle);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  last.current = value;

  return (
    <View style={{ gap: spacing.lg }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <RollingNumber text={formatReadout(value)} style={{ fontSize: readoutSize, lineHeight: Math.round(readoutSize * 1.17) }} />
      </View>
      <GestureDetector gesture={pan}>
        <View
          onLayout={onLayout}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ text: spokenDuration(value) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
          style={{ height: sizes.button, justifyContent: 'center' }}
        >
          <View style={{ height: TRACK, marginHorizontal: THUMB / 2, borderRadius: TRACK / 2, backgroundColor: 'rgba(10,10,10,0.1)' }}>
            <Animated.View style={[{ height: TRACK, borderRadius: TRACK / 2, backgroundColor: colors.primary }, fillStyle]} />
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
                backgroundColor: colors.primary,
                borderWidth: 4,
                borderColor: colors.surface,
                shadowColor: colors.shadow,
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
              },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AppText variant="label" muted>{formatReadout(min)}</AppText>
        <AppText variant="label" muted>{formatReadout(max)}</AppText>
      </View>
    </View>
  );
}
