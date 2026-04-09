import {
  buildWeekDayCreateStartData,
  getAllDayEventDurationDays,
} from '@drag/hooks/utils/weekDay/drag';

describe('weekDayDrag', () => {
  it('calculates all-day durations with and without inclusive end dates', () => {
    const start = new Date('2026-04-09T00:00:00');
    const end = new Date('2026-04-11T00:00:00');

    expect(getAllDayEventDurationDays(start, end, true)).toBe(3);
    expect(getAllDayEventDurationDays(start, end, false)).toBe(2);
  });

  it('builds desktop week/day create drag state', () => {
    const { dragState, dragUpdates } = buildWeekDayCreateStartData({
      clientX: 100,
      clientY: 200,
      currentWeekStart: new Date('2026-04-06T00:00:00Z'),
      dayIndex: 3,
      getDateByDayIndex: (weekStart, dayIndex) => {
        const nextDate = new Date(weekStart);
        nextDate.setDate(weekStart.getDate() + dayIndex);
        return nextDate;
      },
      isMobile: false,
      roundToTimeStep: value => value,
      startHour: 9,
      timeStep: 0.25,
    });

    expect(dragState.dayIndex).toBe(3);
    expect(dragState.startHour).toBe(9);
    expect(dragState.endHour).toBe(10);
    expect(dragUpdates.duration).toBe(1);
    expect(dragUpdates.hourOffset).toBe(0);
  });
});
