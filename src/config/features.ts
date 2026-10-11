/** Build-time switches. */
export const FEATURES = {
  /** Show the paywall after onboarding. In development builds without a store key it shows placeholder prices and a "Continue" button. */
  paywall: true,
} as const;
