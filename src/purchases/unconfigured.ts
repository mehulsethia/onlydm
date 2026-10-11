import { NO_ACCESS, type PaymentsProvider } from './types';

/**
 * A release build with no store key: fail closed. Nothing is unlocked and the paywall shows
 * "Couldn't load the plans", instead of silently giving the app away.
 */
export const unconfiguredProvider: PaymentsProvider = {
  mode: 'live',
  getPlans: async () => {
    throw new Error('Store is not configured.');
  },
  getState: async () => NO_ACCESS,
  purchase: async () => {
    throw new Error('Store is not configured.');
  },
  restore: async () => NO_ACCESS,
  getSupportId: async () => null,
  onChange: () => () => {},
};
