/**
 * The OnlyDM mark: a paper plane, drawn as two pieces. Black on light backgrounds, white on dark.
 * Same shapes as the app icon (scripts/make-icon.py in the repo root).
 */
export function OnlyDMMark({ size = 28, on = 'light', title }: { size?: number; on?: 'light' | 'dark'; title?: string }) {
  const fill = on === 'dark' ? '#FFFFFF' : '#0A0A0A';
  return (
    <svg width={size} height={size} viewBox="64 120 328 328" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M70 229L378 126L210 296Z" fill={fill} />
      <path d="M216 303L385 133L283 441Z" fill={fill} />
    </svg>
  );
}
