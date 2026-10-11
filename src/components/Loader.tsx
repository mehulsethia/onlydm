import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { colors } from '@/theme/tokens';
import { OnlyDMMark, MARK_ASPECT, MARK_PIECES, MARK_VIEWBOX, markColor, type MarkVariant } from './OnlyDMMark';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Each piece of the plane gets 400 ms; they light in turn and loop. */
const DOT_MS = 400;
const LOW = 0.3;

function Piece({ index, phase, d, fill }: { index: number; phase: SharedValue<number>; d: string; fill: string }) {
  const props = useAnimatedProps(() => {
    // Position inside this piece's 400 ms slot, 0..1, or outside it.
    const t = phase.value - index;
    const lit = t >= 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
    return { opacity: LOW + (1 - LOW) * lit };
  });
  return <AnimatedPath d={d} fill={fill} animatedProps={props} />;
}

interface Props {
  size?: number;
  variant?: MarkVariant;
  label?: string;
}

/** The plane with its two pieces pulsing in turn. Static mark under Reduce Motion. */
export function Loader({ size = 48, variant = 'onLight', label = 'Loading' }: Props) {
  const reduce = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    phase.value = withRepeat(withTiming(MARK_PIECES.length, { duration: DOT_MS * MARK_PIECES.length, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(phase);
  }, [reduce, phase]);

  if (reduce) return <OnlyDMMark size={size} variant={variant} label={label} />;

  const fill = markColor(variant);
  return (
    <Svg width={size * MARK_ASPECT} height={size} viewBox={MARK_VIEWBOX} accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      {MARK_PIECES.map((d, i) => (
        <Piece key={d} index={i} phase={phase} d={d} fill={fill} />
      ))}
    </Svg>
  );
}

/** Full-screen wait: the loader centred on the background. */
export function FullScreenLoader({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Loader size={56} label={label} />
    </View>
  );
}
