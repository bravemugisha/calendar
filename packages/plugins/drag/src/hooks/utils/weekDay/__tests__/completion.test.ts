import { dateToZonedDateTime, temporalToDate } from '@dayflow/core';
import {
  buildWeekDayCreateEvent,
  buildWeekDayDropEvent,
  finalizeWeekDayDragHours,
} from '@drag/hooks/utils/weekDay/completion';

describe('weekDayCompletion', () => {
  it('keeps cross-day timed resize hours untouched when finalizing', () => {
    const result = finalizeWeekDayDragHours({
      drag: {
        allDay: false,
        endHour: 24,
        mode: 'resize',
        originalStartDate: new Date('2026-04-09T22:00:00'),
        originalEndDate: new Date('2026-04-10T02:00:00'),
        resizeDirection: 'bottom',
        startHour: 22,
      },
      getEffectiveDaySpan: () => 1,
      minDuration: 0.25,
      roundToTimeStep: value => value,
    });

    expect(result.hasCrossDayTimedResize).toBe(true);
    expect(result.finalStartHour).toBe(22);
    expect(result.finalEndHour).toBe(24);
  });

  it('builds a week/day create event with the target day and hours', () => {
    const event = buildWeekDayCreateEvent({
      appTimeZone: 'UTC',
      currentWeekStart: new Date('2026-04-06T00:00:00'),
      drag: {
        allDay: false,
        dayIndex: 4,
      },
      finalEndHour: 11,
      finalStartHour: 9,
      getDateByDayIndex: (weekStart, dayIndex) => {
        const nextDate = new Date(weekStart);
        nextDate.setDate(weekStart.getDate() + dayIndex);
        return nextDate;
      },
      title: 'newEvent',
      writableCalendarId: 'work',
    });

    expect(event.day).toBe(4);
    expect(event.calendarId).toBe('work');
    expect(temporalToDate(event.start).toISOString()).toBe(
      '2026-04-10T09:00:00.000Z'
    );
    expect(temporalToDate(event.end).toISOString()).toBe(
      '2026-04-10T11:00:00.000Z'
    );
  });

  it('builds a canonicalized timed resize drop event', () => {
    const originalEvent = {
      id: 'event-3',
      title: 'Resize me',
      day: 2,
      start: dateToZonedDateTime(new Date('2026-04-08T09:00:00'), 'UTC'),
      end: dateToZonedDateTime(new Date('2026-04-08T10:00:00'), 'UTC'),
      allDay: false,
      calendarId: 'work',
    };

    const updatedEvent = buildWeekDayDropEvent({
      appTimeZone: 'UTC',
      canonicalizeEditedEvent: (_original, visual) => ({
        ...visual,
        title: `${visual.title} canonical`,
      }),
      currentWeekStart: new Date('2026-04-06T00:00:00'),
      drag: {
        allDay: false,
        dayIndex: 4,
        mode: 'move',
      },
      finalEndHour: 11,
      finalStartHour: 9,
      getDateByDayIndex: (weekStart, dayIndex) => {
        const nextDate = new Date(weekStart);
        nextDate.setDate(weekStart.getDate() + dayIndex);
        return nextDate;
      },
      originalEvent,
    });

    expect(updatedEvent.title).toBe('Resize me canonical');
    expect(updatedEvent.day).toBe(4);
    expect(temporalToDate(updatedEvent.start).toISOString()).toBe(
      '2026-04-10T09:00:00.000Z'
    );
    expect(temporalToDate(updatedEvent.end).toISOString()).toBe(
      '2026-04-10T11:00:00.000Z'
    );
  });
});
