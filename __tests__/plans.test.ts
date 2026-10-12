import {
  billingSummary,
  cancellationNote,
  customerStateFrom,
  formatPrice,
  mapPackage,
  mapPackages,
  trialDaysOf,
  trialEndDate,
  yearlySavingsPercent,
  yearlySavingsAmount,
  pricePerMonth,
  withTrialEligibility,
  trialDuration,
  trialFinePrint,
  type PackageLike,
} from '../src/purchases/plans';
import { NO_ACCESS, type Plan } from '../src/purchases/types';

const pkg = (over: Partial<PackageLike> & { intro?: PackageLike['product']['introPrice'] } = {}): PackageLike => ({
  identifier: '$rc_monthly',
  packageType: 'MONTHLY',
  product: {
    identifier: 'onlydm_monthly',
    price: 4.99,
    priceString: '$4.99',
    currencyCode: 'USD',
    introPrice: over.intro === undefined ? { price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7 } : over.intro,
  },
  ...over,
});

describe('trialDaysOf', () => {
  it('reads free intro periods in days, weeks, months', () => {
    expect(trialDaysOf({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7 })).toBe(7);
    expect(trialDaysOf({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 })).toBe(7);
    expect(trialDaysOf({ price: 0, periodUnit: 'MONTH', periodNumberOfUnits: 1 })).toBe(30);
  });
  it('ignores paid intro prices and missing intros', () => {
    expect(trialDaysOf({ price: 0.99, periodUnit: 'MONTH', periodNumberOfUnits: 1 })).toBeNull();
    expect(trialDaysOf(null)).toBeNull();
    expect(trialDaysOf(undefined)).toBeNull();
  });
});

describe('mapPackage(s)', () => {
  it('maps monthly and annual packages with the store price string untouched', () => {
    expect(mapPackage(pkg())).toEqual({ id: '$rc_monthly', kind: 'monthly', priceString: '$4.99', price: 4.99, currencyCode: 'USD', trialDays: 7 });
    expect(mapPackage(pkg({ identifier: '$rc_annual', packageType: 'ANNUAL' }))?.kind).toBe('yearly');
  });
  it('drops other package types', () => {
    expect(mapPackage(pkg({ packageType: 'WEEKLY' }))).toBeNull();
  });
  it('maps a lifetime package and puts it last', () => {
    const lifetime = pkg({ identifier: '$rc_lifetime', packageType: 'LIFETIME', intro: null });
    expect(mapPackage(lifetime)?.kind).toBe('lifetime');
    const plans = mapPackages([lifetime, pkg(), pkg({ identifier: '$rc_annual', packageType: 'ANNUAL' })]);
    expect(plans.map((p) => p.kind)).toEqual(['yearly', 'monthly', 'lifetime']);
  });
  it('orders yearly first', () => {
    const plans = mapPackages([pkg(), pkg({ identifier: '$rc_annual', packageType: 'ANNUAL' })]);
    expect(plans.map((p) => p.kind)).toEqual(['yearly', 'monthly']);
  });
  it('shows no trial when the user is not eligible (no intro price)', () => {
    expect(mapPackage(pkg({ intro: null }))?.trialDays).toBeNull();
  });
});

describe('customerStateFrom', () => {
  it('is pro with an active "onlydm_pro" entitlement and detects trials', () => {
    const state = customerStateFrom({ entitlements: { active: { onlydm_pro: { expirationDate: '2026-11-01T00:00:00Z', willRenew: true, periodType: 'TRIAL' } } } });
    expect(state).toEqual({ isPro: true, inTrial: true, expiresAt: '2026-11-01T00:00:00Z', willRenew: true, lifetime: false });
  });
  it('treats an entitlement with no expiry date as lifetime', () => {
    const state = customerStateFrom({ entitlements: { active: { onlydm_pro: { expirationDate: null, willRenew: false, periodType: 'NORMAL' } } } });
    expect(state).toEqual({ isPro: true, inTrial: false, expiresAt: null, willRenew: false, lifetime: true });
  });
  it('has no access without the entitlement', () => {
    expect(customerStateFrom({ entitlements: { active: {} } })).toEqual(NO_ACCESS);
    expect(customerStateFrom({ entitlements: { active: { other: { expirationDate: null, willRenew: false, periodType: 'NORMAL' } } } })).toEqual(NO_ACCESS);
  });
});

describe('dates and disclosure', () => {
  const now = new Date(2026, 9, 6, 12, 0, 0); // 6 Oct 2026, local time
  const yearly: Plan = { id: 'y', kind: 'yearly', priceString: '$29.99', price: 29.99, currencyCode: 'USD', trialDays: 7 };
  const monthly: Plan = { id: 'm', kind: 'monthly', priceString: '$4.99', price: 4.99, currencyCode: 'USD', trialDays: 7 };

  it('adds trial days, across month boundaries', () => {
    expect(trialEndDate(now, 7).getDate()).toBe(13);
    expect(trialEndDate(new Date(2026, 9, 28), 7).getMonth()).toBe(10);
    expect(now.getDate()).toBe(6); // input not mutated
  });

  it('states the trial end date, then the real price and period', () => {
    const text = billingSummary(yearly, now, 'en-US');
    expect(text).toBe('Free for 7 days, until October 13, 2026. Then $29.99 per year.');
  });

  it('states charge-today for plans without a trial', () => {
    expect(billingSummary({ ...monthly, trialDays: null }, now, 'en-US')).toBe('$4.99 per month, charged today.');
  });

  it('cancellation note names the store and the date', () => {
    expect(cancellationNote(monthly, now, 'App Store', 'en-US')).toContain('Apple ID settings');
    expect(cancellationNote(monthly, now, 'App Store', 'en-US')).toContain('October 13, 2026');
    expect(cancellationNote(monthly, now, 'Google Play', 'en-US')).toContain('Play Store');
  });
});

describe('yearlySavingsPercent', () => {
  const m: Plan = { id: 'm', kind: 'monthly', priceString: '', price: 5, currencyCode: 'USD', trialDays: null };
  it('computes the real saving', () => {
    expect(yearlySavingsPercent(m, { ...m, kind: 'yearly', price: 30 })).toBe(50);
  });
  it('returns null when there is no saving or currencies differ', () => {
    expect(yearlySavingsPercent(m, { ...m, kind: 'yearly', price: 60 })).toBeNull();
    expect(yearlySavingsPercent(m, { ...m, kind: 'yearly', price: 30, currencyCode: 'INR' })).toBeNull();
  });
});

describe('formatPrice', () => {
  it('formats currency', () => {
    expect(formatPrice(2.5, 'USD', 'en-US')).toBe('$2.50');
  });
  it('formats INR and JPY in their own currency', () => {
    expect(formatPrice(1999, 'INR', 'en-IN')).toMatch(/₹\s?1,999/);
    expect(formatPrice(3000, 'JPY', 'en-US')).toMatch(/¥3,000/);
    expect(formatPrice(1999 / 12, 'INR', 'en-IN')).not.toContain('$');
  });
  it('falls back for unknown currency codes', () => {
    expect(formatPrice(2.5, 'not-a-code')).toContain('2.50');
  });
});

describe('launch pricing', () => {
  const plan = (kind: 'monthly' | 'yearly', price: number, currencyCode: string) => ({
    id: kind,
    kind,
    price,
    currencyCode,
    priceString: String(price),
    trialDays: null,
  });

  it('saves 69% ($32.89 a year) on $3.99 monthly vs $14.99 yearly', () => {
    const m = plan('monthly', 3.99, 'USD');
    const y = plan('yearly', 14.99, 'USD');
    expect(yearlySavingsPercent(m, y)).toBe(69);
    expect(yearlySavingsAmount(m, y)).toBe(32.89);
    expect(formatPrice(pricePerMonth(y), 'USD', 'en-US')).toBe('$1.25');
  });

  it('saves 72% (₹2,589 a year) on ₹299 monthly vs ₹999 yearly', () => {
    const m = plan('monthly', 299, 'INR');
    const y = plan('yearly', 999, 'INR');
    expect(yearlySavingsPercent(m, y)).toBe(72);
    expect(yearlySavingsAmount(m, y)).toBe(2589);
    expect(Math.round(pricePerMonth(y) * 100) / 100).toBe(83.25);
  });

  it('shows no saving across currencies or when yearly costs more', () => {
    expect(yearlySavingsAmount(plan('monthly', 3.99, 'USD'), plan('yearly', 999, 'INR'))).toBeNull();
    expect(yearlySavingsAmount(plan('monthly', 1, 'USD'), plan('yearly', 20, 'USD'))).toBeNull();
  });
});

describe('lifetime plan text', () => {
  const now = new Date(2026, 9, 6, 12, 0, 0);
  const lifetime: Plan = { id: 'l', kind: 'lifetime', priceString: '$49.99', price: 49.99, currencyCode: 'USD', trialDays: null };
  it('says one-time, with no renewal', () => {
    expect(billingSummary(lifetime, now)).toBe('$49.99 one-time purchase, charged today. No subscription.');
    expect(cancellationNote(lifetime, now, 'App Store')).toMatch(/no renewal/);
  });
});

describe('localised plan maths', () => {
  const plan = (kind: 'monthly' | 'yearly', price: number, currencyCode: string): Plan => ({ id: kind, kind, priceString: '', price, currencyCode, trialDays: null });
  it('uses the real local prices: India', () => {
    const m = plan('monthly', 299, 'INR');
    const y = plan('yearly', 1999, 'INR');
    expect(yearlySavingsPercent(m, y)).toBe(44);
    expect(yearlySavingsAmount(m, y)).toBe(1589);
  });
  it('uses the real local prices: Japan, no decimals', () => {
    const m = plan('monthly', 600, 'JPY');
    const y = plan('yearly', 3000, 'JPY');
    expect(yearlySavingsPercent(m, y)).toBe(58);
    expect(yearlySavingsAmount(m, y)).toBe(4200);
    expect(pricePerMonth(y)).toBe(250);
  });
  it('shows no saving when yearly is not cheaper', () => {
    const m = plan('monthly', 100, 'USD');
    expect(yearlySavingsPercent(m, plan('yearly', 1200, 'USD'))).toBeNull();
    expect(yearlySavingsAmount(m, plan('yearly', 1300, 'USD'))).toBeNull();
  });
});

describe('trial eligibility and wording', () => {
  const y: Plan = { id: 'y', kind: 'yearly', priceString: '₹999.00', price: 999, currencyCode: 'INR', trialDays: 7 };
  const m: Plan = { id: 'm', kind: 'monthly', priceString: '₹299.00', price: 299, currencyCode: 'INR', trialDays: null };
  it('keeps the trial only for eligible plans', () => {
    expect(withTrialEligibility([y, m], new Set(['y']))[0].trialDays).toBe(7);
    expect(withTrialEligibility([y, m], new Set())[0].trialDays).toBeNull();
    expect(withTrialEligibility([y, m], new Set())[1]).toEqual(m);
  });
  it('builds the duration from the store trial length', () => {
    expect(trialDuration(7)).toEqual({ adjective: '1-week', phrase: '1 week' });
    expect(trialDuration(14)).toEqual({ adjective: '2-week', phrase: '2 weeks' });
    expect(trialDuration(30).phrase).toBe('1 month');
    expect(trialDuration(3).adjective).toBe('3-day');
  });
  it('fine print has the trial, then the price, and no "charged today"', () => {
    expect(trialFinePrint(y, 'App Store')).toBe('1 week free, then ₹999.00/year. Cancel anytime in Apple ID settings.');
  });
});
