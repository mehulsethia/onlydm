import Svg, { Path } from 'react-native-svg';
import { palette } from '@/theme/tokens';

/**
 * The OnlyDM mark: a paper plane in two pieces, the wing and the folded tail. Same shapes as the app icon
 * (scripts/make-icon.py) and assets/brand/onlydm-mark-*.svg; do not redraw.
 */
export const MARK_VIEWBOX = '64 120 328 328';
export const MARK_WING = 'M70 229L378 126L210 296Z';
export const MARK_TAIL = 'M216 303L385 133L283 441Z';
export const MARK_PIECES = [MARK_WING, MARK_TAIL] as const;

export type MarkVariant = 'onDark' | 'onLight';

/** Ink for each background: black on light pages, white on dark. */
export const markColor = (variant: MarkVariant) => (variant === 'onDark' ? palette.white : palette.black);

/** The mark is square. */
export const MARK_ASPECT = 1;

interface Props {
  /** Height and width in points. */
  size?: number;
  variant?: MarkVariant;
  /** Accessible name. Omit when the mark sits next to the word "OnlyDM". */
  label?: string;
}

export function OnlyDMMark({ size = 32, variant = 'onLight', label }: Props) {
  const fill = markColor(variant);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={MARK_VIEWBOX}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
    >
      {MARK_PIECES.map((d) => (
        <Path key={d} d={d} fill={fill} />
      ))}
    </Svg>
  );
}
