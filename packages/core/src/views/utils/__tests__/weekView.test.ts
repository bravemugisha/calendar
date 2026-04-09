import {
  buildFullWeekDates,
  buildMobileWeekDayLabels,
  buildWeekDayLabels,
} from '@/views/utils/weekView';

const getWeekDaysLabels = (
  _locale: string,
  format: 'long' | 'short' | 'narrow' = 'short'
) => {
  if (format === 'narrow') {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
};

describe('weekView utils', () => {
  it('builds sliding-view weekday labels from the display start date', () => {
    const labels = buildWeekDayLabels({
      displayDays: 3,
      displayStart: new Date(2026, 3, 9),
      getWeekDaysLabels,
      isSlidingView: true,
      locale: 'en-US',
      startOfWeek: 1,
    });

    expect(labels).toEqual(['Thu', 'Fri', 'Sat']);
  });

  it('keeps Tuesday and Thursday distinct in english mobile labels', () => {
    const labels = buildMobileWeekDayLabels(true, 'en-US', getWeekDaysLabels, [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);

    expect(labels).toEqual(['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']);
  });

  it('marks the current day in full week dates', () => {
    const dates = buildFullWeekDates(
      new Date(2026, 3, 6),
      'en-US',
      new Date(2026, 3, 9),
      'UTC'
    );

    expect(dates).toHaveLength(7);
    expect(dates[3]?.isCurrent).toBe(true);
    expect(dates[0]?.dayName).toBe('Mon');
  });
});
