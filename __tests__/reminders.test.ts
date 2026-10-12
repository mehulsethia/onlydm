import { DEFAULT_TIMES, formatClock, gapBetween, nudgeTime, reminderCopy, sanitiseTimes } from '../src/notifications/reminderPlan';

describe('defaults', () => {
  it('are 9 AM and 9 PM, 12 hours apart', () => {
    expect(DEFAULT_TIMES).toEqual([540, 1260]);
    expect(gapBetween(540, 1260)).toBe(720);
  });
});

describe('gapBetween', () => {
  it('goes the short way round midnight', () => {
    expect(gapBetween(23 * 60, 60)).toBe(120);
  });
});

describe('sanitiseTimes', () => {
  it('keeps a valid pair', () => expect(sanitiseTimes([600, 1200])).toEqual([600, 1200]));
  it('falls back for bad or too-close data', () => {
    expect(sanitiseTimes(null)).toEqual(DEFAULT_TIMES);
    expect(sanitiseTimes([600])).toEqual(DEFAULT_TIMES);
    expect(sanitiseTimes([600, 'x'])).toEqual(DEFAULT_TIMES);
    expect(sanitiseTimes([600, 700])).toEqual(DEFAULT_TIMES);
    expect(sanitiseTimes([-5, 700])).toEqual(DEFAULT_TIMES);
  });
});

describe('nudgeTime', () => {
  it('moves by the delta', () => expect(nudgeTime([540, 1260], 0, 30)).toEqual([570, 1260]));
  it('ignores a move that gets closer than 8 hours', () => {
    const t: [number, number] = [540, 1020];
    expect(nudgeTime(t, 1, -30)).toBe(t);
  });
  it('wraps past midnight', () => expect(nudgeTime([0, 720], 0, -30)).toEqual([1410, 720]));
  it('rejects a move that closes the gap', () => {
    const t: [number, number] = [0, 480];
    expect(nudgeTime(t, 0, 30)).toBe(t);
  });
});

describe('formatClock', () => {
  it('formats 12-hour times', () => {
    expect(formatClock(0)).toBe('12:00 AM');
    expect(formatClock(540)).toBe('9:00 AM');
    expect(formatClock(750)).toBe('12:30 PM');
    expect(formatClock(1260)).toBe('9:00 PM');
  });
});

describe('reminderCopy', () => {
  it('is always titled OnlyDM with a body', () => {
    for (let d = 0; d < 10; d++) for (const s of [0, 1] as const) {
      const c = reminderCopy(s, 10, d);
      expect(c.title).toBe('OnlyDM');
      expect(c.body.length).toBeGreaterThan(10);
    }
  });
  it('mentions the user\'s talking time only when set', () => {
    expect(reminderCopy(0, 10, 0).body).toContain('10 min');
    expect(reminderCopy(0, 0, 0).body).not.toContain('You said');
    expect(reminderCopy(0, null, 0).body).not.toContain('You said');
  });
  it('rotates the wording by day', () => {
    expect(reminderCopy(0, null, 1).body).not.toBe(reminderCopy(0, null, 2).body);
  });
});
