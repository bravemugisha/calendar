import {
  getDayIndexForDate,
  getEffectiveDaySpan,
} from '@drag/hooks/utils/eventEditing';

describe('eventEditing', () => {
  it('treats overnight timed events ending at midnight within 24 hours as same-day spans', () => {
    const start = new Date('2026-04-09T12:00:00');
    const end = new Date('2026-04-10T00:00:00');

    expect(getEffectiveDaySpan(start, end, false)).toBe(0);
  });

  it('keeps real multi-day timed events spanning beyond 24 hours as cross-day spans', () => {
    const start = new Date('2026-04-09T12:00:00');
    const end = new Date('2026-04-11T00:00:00');

    expect(getEffectiveDaySpan(start, end, false)).toBe(2);
  });

  it('calculates day indexes relative to the current week start', () => {
    const weekStart = new Date('2026-04-06T00:00:00');
    const target = new Date('2026-04-09T15:00:00');

    expect(getDayIndexForDate(weekStart, target)).toBe(3);
    expect(getDayIndexForDate(undefined, target, 8)).toBe(8);
  });
});
