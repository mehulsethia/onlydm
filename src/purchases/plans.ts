import { NO_ACCESS, type CustomerState, type Plan, type PlanKind } from './types';

/** Pure helpers: mapping store data to plans, dates and disclosure text. No React, no native code. */

export const ENTITLEMENT_ID = 'onlydm_pro';

/** Minimal structural shapes of the RevenueCat objects we read, so this stays testable. */
export interface PackageLike {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    price: number;
    priceString: string;
    currencyCode: string;
    introPrice?: { price: number; periodUnit: string; periodNumberOfUnits: number } | null;
  };
}

export interface CustomerInfoLike {
  entitlements: {
    active: Record<string, { expirationDate: string | null; willRenew: boolean; periodType: string } | undefined>;
  };
}

const DAYS_PER_UNIT: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

export function kindOf(packageType: string): PlanKind | null {
  if (packageType === 'MONTHLY') return 'monthly';
  if (packageType === 'ANNUAL') return 'yearly';
  if (packageType === 'LIFETIME') return 'lifetime';
  return null;
}

/** Days of free trial, only for genuinely free (price 0) introductory periods. */
export function trialDaysOf(intro: PackageLike['product']['introPrice']): number | null {
  if (!intro || intro.price !== 0) return null;
  const per = DAYS_PER_UNIT[intro.periodUnit];
  return per ? per * intro.periodNumberOfUnits : null;
}

export function mapPackage(pkg: PackageLike): Plan | null {
  const kind = kindOf(pkg.packageType);
  if (!kind) return null;
  return {
    id: pkg.identifier,
    kind,
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currencyCode: pkg.product.currencyCode,
    trialDays: trialDaysOf(pkg.product.introPrice),
  };
}

const ORDER: Record<PlanKind, number> = { yearly: 0, monthly: 1, lifetime: 2 };

/** Yearly first, as the default choice; then monthly; lifetime last. */
export function mapPackages(pkgs: PackageLike[]): Plan[] {
  return pkgs
    .map(mapPackage)
    .filter((p): p is Plan => p !== null)
    .sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
}

export function customerStateFrom(info: CustomerInfoLike, entitlementId = ENTITLEMENT_ID): CustomerState {
  const e = info.entitlements.active[entitlementId];
  if (!e) return NO_ACCESS;
  // A one-time purchase never expires, so it has no expiration date.
  return { isPro: true, inTrial: e.periodType === 'TRIAL', expiresAt: e.expirationDate, willRenew: e.willRenew, lifetime: e.expirationDate === null };
}

export function trialEndDate(from: Date, trialDays: number): Date {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + trialDays);
  return d;
}

export function formatDate(d: Date, locale?: string): string {
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Honest saving of yearly vs twelve monthly payments; null when there is none or currencies differ. */
export function yearlySavingsPercent(monthly: Plan, yearly: Plan): number | null {
  if (monthly.currencyCode !== yearly.currencyCode || monthly.price <= 0) return null;
  const pct = Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
  return pct > 0 ? pct : null;
}

/** What the yearly plan saves over twelve monthly payments, in the plans' currency; null when none or currencies differ. */
export function yearlySavingsAmount(monthly: Plan, yearly: Plan): number | null {
  if (monthly.currencyCode !== yearly.currencyCode || monthly.price <= 0) return null;
  const saving = Math.round((monthly.price * 12 - yearly.price) * 100) / 100;
  return saving > 0 ? saving : null;
}

/** A plan's price spread over a month (the yearly price divided by 12). */
export const pricePerMonth = (plan: Plan): number => (plan.kind === 'yearly' ? plan.price / 12 : plan.price);

export function formatPrice(amount: number, currencyCode: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

const PERIOD_WORD: Record<PlanKind, string> = { monthly: 'month', yearly: 'year', lifetime: 'once' };
export const periodWord = (kind: PlanKind) => PERIOD_WORD[kind];

/** What the user must see before the purchase button: trial end date, then price and period. */
export function billingSummary(plan: Plan, now: Date, locale?: string): string {
  if (plan.kind === 'lifetime') return `${plan.priceString} one-time purchase, charged today. No subscription.`;
  const period = periodWord(plan.kind);
  if (plan.trialDays) {
    const end = formatDate(trialEndDate(now, plan.trialDays), locale);
    return `Free for ${plan.trialDays} days, until ${end}. Then ${plan.priceString} per ${period}.`;
  }
  return `${plan.priceString} per ${period}, charged today.`;
}

export function cancellationNote(plan: Plan, now: Date, store: 'App Store' | 'Google Play', locale?: string): string {
  if (plan.kind === 'lifetime') return 'One-time purchase: no subscription and no renewal. Restore it any time with the same Apple ID.';
  const where = store === 'App Store' ? 'your Apple ID settings' : 'the Play Store';
  if (plan.trialDays) {
    const end = formatDate(trialEndDate(now, plan.trialDays), locale);
    return `Cancel any time in ${where}. Cancel before ${end} and you won't be charged. Renews automatically until cancelled.`;
  }
  return `Cancel any time in ${where}. Renews automatically until cancelled.`;
}
