import { dateToZonedDateTime, temporalToDate } from '@dayflow/core';
import {
  buildDateGridCreateEvent,
  buildDateGridMoveStartData,
  shouldActivateDateGridMove,
} from '@drag/hooks/utils/dateGridDrag';

describe('dateGridDrag', () => {
  it('builds a default 9-10am month/year create event', () => {
    const event = buildDateGridCreateEvent({
      appTimeZone: 'UTC',
      calendarId: 'work',
      targetDate: new Date('2026-04-09T00:00:00Z'),
      title: 'newEvent',
    });

    expect(event.calendarId).toBe('work');
    expect(event.title).toBe('newEvent');
    expect(event.allDay).toBe(false);
    expect(temporalToDate(event.start).toISOString()).toBe(
      '2026-04-09T09:00:00.000Z'
    );
    expect(temporalToDate(event.end).toISOString()).toBe(
      '2026-04-09T10:00:00.000Z'
    );
  });

  it('builds month/year move drag state with deferred mouse activation', () => {
    const sourceElement = document.createElement('div');
    sourceElement.dataset.segmentDays = '3';

    const { currentDragOffset, dragState, dragUpdates } =
      buildDateGridMoveStartData({
        clientX: 140,
        clientY: 60,
        event: {
          id: 'event-1',
          title: 'Trip',
          start: dateToZonedDateTime(new Date('2026-04-09T09:00:00Z'), 'UTC'),
          end: dateToZonedDateTime(new Date('2026-04-11T10:00:00Z'), 'UTC'),
          allDay: false,
          calendarId: 'work',
        },
        eventDurationDays: 3,
        eventEndDate: new Date('2026-04-11T10:00:00Z'),
        eventStartDate: new Date('2026-04-09T09:00:00Z'),
        isTouchLike: false,
        sourceElement,
        sourceRect: {
          left: 100,
          top: 20,
          width: 80,
          height: 24,
        } as DOMRect,
      });

    expect(currentDragOffset).toEqual({ x: 40, y: 40 });
    expect(dragState.eventId).toBe('event-1');
    expect(dragUpdates.active).toBe(false);
    expect(dragUpdates.pendingMove).toBe(true);
    expect(dragUpdates.currentSegmentDays).toBe(3);
    expect(dragUpdates.dragOffset).toBe(40);
    expect(dragUpdates.dragOffsetY).toBe(12);
  });

  it('activates month/year move after threshold', () => {
    expect(
      shouldActivateDateGridMove({
        clientX: 14,
        clientY: 14,
        startX: 10,
        startY: 10,
      })
    ).toBe(true);
    expect(
      shouldActivateDateGridMove({
        clientX: 11,
        clientY: 11,
        startX: 10,
        startY: 10,
      })
    ).toBe(false);
  });
});
