import { connectedPlatforms } from './platforms';
import { storage } from './storage';

/**
 * Local app state only: onboarding position, the two time answers.
 * Credentials, cookies and message content are never read or stored here.
 */
export const KEYS = {
  onboardingStep: 'onboardingStep',
  onboardingComplete: 'onboardingComplete',
  totalMinutes: 'totalMinutes',
  talkingMinutes: 'talkingMinutes',
} as const;

export function readProgress() {
  return {
    /** Signed in to at least one platform. */
    signedIn: connectedPlatforms().length > 0,
    onboardingComplete: storage.getBoolean(KEYS.onboardingComplete) ?? false,
    step: storage.getString(KEYS.onboardingStep) ?? null,
    totalMinutes: storage.getNumber(KEYS.totalMinutes) ?? null,
    talkingMinutes: storage.getNumber(KEYS.talkingMinutes) ?? null,
  };
}

export const markOnboardingComplete = () => storage.set(KEYS.onboardingComplete, true);
export const saveStep = (step: string) => storage.set(KEYS.onboardingStep, step);
export const saveTotal = (minutes: number) => storage.set(KEYS.totalMinutes, minutes);
export const saveTalking = (minutes: number) => storage.set(KEYS.talkingMinutes, minutes);
export const clearProgress = () => storage.clearAll();
