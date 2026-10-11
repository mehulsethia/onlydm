import { useEffect } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { toColumns } from '@/motion/digits';
import { colors, typeScale } from '@/theme/tokens';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ digit, lineHeight, style }: { digit: number; lineHeight: number; style: TextStyle }) {
  const reduce = useReducedMotion();
  const y = useSharedValue(reduce ? -digit * lineHeight : 0);
  useEffect(() => {
    // Short ease-out, no spring or stagger: while dragging, each new target retargets smoothly instead of overshooting.
    y.value = reduce ? -digit * lineHeight : withTiming(-digit * lineHeight, { duration: 140, easing: Easing.out(Easing.cubic) });
  }, [digit, lineHeight, reduce, y]);
  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ height: lineHeight, overflow: 'hidden' }}>
      <Animated.View style={strip}>
        {DIGITS.map((d) => (
          <Text key={d} style={[style, { height: lineHeight, lineHeight }]}>{d}</Text>
        ))}
      </Animated.View>
    </View>
  );
}

/** Readout whose digits roll to their value; units and spaces hold still. Tabular, so nothing jumps. */
export function RollingNumber({ text, style }: { text: string; style?: TextStyle }) {
  const base: TextStyle = { ...typeScale.readout, color: colors.text, ...style };
  const lineHeight = base.lineHeight ?? 62;
  const cols = toColumns(text);
  return (
    <View accessible accessibilityLabel={text} style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {cols.map((c, i) => {
        // Keyed from the right, so "9 min" becoming "1 h 00 min" keeps the units' columns instead of re-spinning every digit.
        const key = cols.length - i;
        return c.digit === null ? (
          <Text key={key} importantForAccessibility="no" style={[base, { height: lineHeight }]}>{c.char}</Text>
        ) : (
          <Digit key={key} digit={c.digit} lineHeight={lineHeight} style={base} />
        );
      })}
    </View>
  );
}
