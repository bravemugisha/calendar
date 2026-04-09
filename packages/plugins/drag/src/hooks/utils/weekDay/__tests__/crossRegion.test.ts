import {
  dateToPlainDate,
  dateToZonedDateTime,
  temporalToDate,
} from '@dayflow/core';
import {
  buildCrossRegionAllDayPreview,
  buildCrossRegionTimedPreview,
  buildUniversalMoveDropResult,
  shouldActivateUniversalMoveIndicator,
} from '@drag/hooks/utils/weekDay/crossRegion';

describe('crossRegionDrag', () => {
  it('activates universal move indicator after threshold', () => {
    expect(
      shouldActivateUniversalMoveIndicator({
        clientX: 13,
        clientY: 14,
        startX: 10,
        startY: 10,
      })
    ).toBe(true);
    expect(
      shouldActivateUniversalMoveIndicator({
        clientX: 11,
        clientY: 11,
        startX: 10,
        startY: 10,
      })
    ).toBe(false);
  });

  it('builds all-day cross-region preview state', () => {
    const { dragState, dragUpdates } = buildCrossRegionAllDayPreview({
      currentWeekStart: new Date('2026-04-06T00:00:00Z'),
      drag: {
        allDay: false,
        dayIndex: 2,
        duration: 1,
        endHour: 10,
        eventId: 'event-1',
        originalEndHour: 10,
        originalStartHour: 9,
        startHour: 9,
      },
      newDayIndex: 4,
    });

    expect(dragState).toMatchObject({
      eventId: 'event-1',
      dayIndex: 4,
      startHour: 0,
      endHour: 0,
      allDay: true,
    });
    expect(dragUpdates).toMatchObject({
      allDay: true,
      dayIndex: 4,
      startHour: 0,
      endHour: 0,
    });
  });

  it('builds timed cross-region preview state with clamped hours', () => {
    const { dragState, dragUpdates } = buildCrossRegionTimedPreview({
      currentWeekStart: new Date('2026-04-06T00:00:00Z'),
      drag: {
        allDay: false,
        dayIndex: 2,
        duration: 2,
        endHour: 11,
        eventId: 'event-1',
        hourOffset: 0,
        originalEndHour: 11,
        originalStartHour: 9,
        startHour: 9,
      },
      firstHour: 0,
      lastHour: 24,
      mouseHour: 23,
      newDayIndex: 5,
      roundToTimeStep: value => value,
      timeStep: 0.25,
    });

    expect(dragState).toMatchObject({
      eventId: 'event-1',
      dayIndex: 5,
      startHour: 22,
      endHour: 24,
      allDay: false,
    });
    expect(dragUpdates).toMatchObject({
      allDay: false,
      dayIndex: 5,
      startHour: 22,
      endHour: 24,
    });
  });

  it('builds a moved timed event for cross-region drops', () => {
    const targetEvent = {
      id: 'event-1',
      title: 'Focus',
      day: 2,
      start: dateToZonedDateTime(new Date('2026-04-08T09:00:00'), 'UTC'),
      end: dateToZonedDateTime(new Date('2026-04-08T10:00:00'), 'UTC'),
      allDay: false,
      calendarId: 'work',
    };

    const { updatedEvent, originalEvent } = buildUniversalMoveDropResult({
      appTimeZone: 'UTC',
      canonicalizeEditedEvent: (_original, visual) => visual,
      currentWeekStart: new Date('2026-04-06T00:00:00'),
      drag: {
        allDay: false,
        dayIndex: 4,
        endHour: 10,
        originalDay: 2,
        originalEvent: targetEvent,
        startDragDayIndex: 2,
        startHour: 9,
      },
      getEffectiveDaySpan: () => 0,
      minDuration: 0.25,
      roundToTimeStep: value => value,
      targetEvent,
    });

    expect(originalEvent).toBe(targetEvent);
    expect(updatedEvent.day).toBe(4);
    expect(temporalToDate(updatedEvent.start).toISOString()).toBe(
      '2026-04-10T09:00:00.000Z'
    );
    expect(temporalToDate(updatedEvent.end).toISOString()).toBe(
      '2026-04-10T10:00:00.000Z'
    );
  });

  it('preserves all-day span when moving across days', () => {
    const targetEvent = {
      id: 'event-2',
      title: 'Trip',
      day: 1,
      start: dateToPlainDate(new Date('2026-04-07T00:00:00')),
      end: dateToPlainDate(new Date('2026-04-09T00:00:00')),
      allDay: true,
      calendarId: 'travel',
    };

    const { updatedEvent } = buildUniversalMoveDropResult({
      appTimeZone: 'UTC',
      canonicalizeEditedEvent: (_original, visual) => visual,
      currentWeekStart: new Date('2026-04-06T00:00:00'),
      drag: {
        allDay: true,
        dayIndex: 3,
        endHour: 0,
        eventDurationDays: 2,
        originalDay: 1,
        originalEvent: targetEvent,
        originalStartDate: new Date('2026-04-07T00:00:00'),
        startDragDayIndex: 1,
        startHour: 0,
      },
      getEffectiveDaySpan: () => 0,
      minDuration: 0.25,
      roundToTimeStep: value => value,
      targetEvent,
    });

    expect(updatedEvent.day).toBe(3);
    expect(
      (updatedEvent.start as { year: number; month: number; day: number }).year
    ).toBe(2026);
    expect(
      (updatedEvent.start as { year: number; month: number; day: number }).month
    ).toBe(4);
    expect(
      (updatedEvent.start as { year: number; month: number; day: number }).day
    ).toBe(9);
    expect(
      (updatedEvent.end as { year: number; month: number; day: number }).year
    ).toBe(2026);
    expect(
      (updatedEvent.end as { year: number; month: number; day: number }).month
    ).toBe(4);
    expect(
      (updatedEvent.end as { year: number; month: number; day: number }).day
    ).toBe(11);
  });
});
