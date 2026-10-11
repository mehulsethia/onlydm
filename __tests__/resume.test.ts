import { progressFor } from '../src/state/onboardingSteps';
import { resolveStartRoute, type ProgressSnapshot } from '../src/state/resume';

const base: ProgressSnapshot = {
  signedIn: false,
  onboardingComplete: false,
  step: null,
  totalMinutes: null,
  talkingMinutes: null,
};
const answered: Partial<ProgressSnapshot> = { totalMinutes: 180, talkingMinutes: 10 };
const at = (over: Partial<ProgressSnapshot>) => resolveStartRoute({ ...base, ...over });

describe('resolveStartRoute', () => {
  it('starts at the cold open for a new user', () => {
    expect(at({})).toBe('/(onboarding)/cold-open');
  });

  it('sends a finished, signed-in user straight to the inbox', () => {
    expect(at({ ...answered, signedIn: true, onboardingComplete: true, step: 'paywall' })).toBe('/(main)/inbox');
  });

  it('resumes at the last step reached', () => {
    expect(at({ ...answered, step: 'refund' })).toBe('/(onboarding)/refund');
    expect(at({ step: 'total-time' })).toBe('/(onboarding)/total-time');
  });

  it('ignores unknown stored steps', () => {
    expect(at({ step: 'nonsense' })).toBe('/(onboarding)/cold-open');
  });

  it('goes back for missing answers', () => {
    expect(at({ step: 'receipt' })).toBe('/(onboarding)/total-time');
    expect(at({ step: 'receipt', totalMinutes: 60 })).toBe('/(onboarding)/talking-time');
    expect(at({ step: 'trust', totalMinutes: 60, talkingMinutes: 5 })).toBe('/(onboarding)/trust');
  });

  it('skips year and refund for someone mostly here to talk', () => {
    const talker = { totalMinutes: 45, talkingMinutes: 30 };
    expect(at({ ...talker, step: 'year' })).toBe('/(onboarding)/whats-left');
    expect(at({ ...talker, step: 'refund' })).toBe('/(onboarding)/whats-left');
    expect(at({ ...talker, step: 'receipt' })).toBe('/(onboarding)/receipt');
  });

  it('reopens the sign-in sheet from the trust screen', () => {
    expect(at({ ...answered, step: 'login' })).toBe('/(onboarding)/trust');
  });

  it('skips earlier screens once signed in', () => {
    expect(at({ ...answered, signedIn: true, step: 'total-time' })).toBe('/(onboarding)/trust');
    expect(at({ signedIn: true, step: null })).toBe('/(onboarding)/trust');
  });

  it('keeps later steps for a signed-in user who has not finished', () => {
    expect(at({ ...answered, signedIn: true, step: 'reveal' })).toBe('/(onboarding)/reveal');
    expect(at({ ...answered, signedIn: true, step: 'paywall' })).toBe('/paywall');
  });

  it('does not treat onboardingComplete alone as enough without a session', () => {
    expect(at({ ...answered, onboardingComplete: true, step: 'paywall' })).toBe('/paywall');
  });
});

describe('progressFor', () => {
  it('rises through the flow and ends at 1 on the paywall', () => {
    expect(progressFor('cold-open')).toBeGreaterThan(0);
    expect(progressFor('receipt')).toBeGreaterThan(progressFor('talking-time'));
    expect(progressFor('paywall')).toBe(1);
  });
});
