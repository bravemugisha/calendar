import { render } from '@testing-library/preact';
import { Temporal } from 'temporal-polyfill';

import CalendarEvent from '@/components/calendarEvent/CalendarEvent';
import { ViewType, Event } from '@/types';

const baseEvent: Event = {
  id: 'event-1',
  title: 'Contract Event',
  calendarId: 'default',
  allDay: true,
  start: Temporal.ZonedDateTime.from('2026-04-09T00:00:00+00:00[UTC]'),
  end: Temporal.ZonedDateTime.from('2026-04-11T00:00:00+00:00[UTC]'),
};

describe('CalendarEvent style contract', () => {
  it('exposes semantic data attributes for stateful all-day segments', () => {
    const calendarElement = document.createElement('div');
    const calendarRef = { current: calendarElement };

    const { container } = render(
      <CalendarEvent
        event={baseEvent}
        viewType={ViewType.MONTH}
        isAllDay
        isMultiDay
        segment={{
          id: 'segment-1',
          originalEventId: baseEvent.id,
          event: baseEvent,
          startDayIndex: 0,
          endDayIndex: 2,
          segmentType: 'start',
          totalDays: 3,
          segmentIndex: 0,
          isFirstSegment: true,
          isLastSegment: false,
        }}
        calendarRef={calendarRef}
        hourHeight={60}
        firstHour={0}
        onEventUpdate={jest.fn()}
        onEventDelete={jest.fn()}
      />
    );

    const eventElement = container.querySelector(
      '[data-event-id="event-1"]'
    ) as HTMLDivElement | null;

    expect(eventElement?.className).toContain('df-event');
    expect(eventElement?.dataset.view).toBe(ViewType.MONTH);
    expect(eventElement?.dataset.allDay).toBe('true');
    expect(eventElement?.dataset.multiDay).toBe('true');
    expect(eventElement?.dataset.segmentShape).toBe('start');
    expect(eventElement?.dataset.monthStack).toBe('false');
  });

  it('suppresses the synthetic click after a touch tap so mobile opens only one path', () => {
    const calendarElement = document.createElement('div');
    const calendarRef = { current: calendarElement };
    const onEventSelect = jest.fn();
    const onDetailPanelToggle = jest.fn();

    const timedEvent: Event = {
      ...baseEvent,
      allDay: false,
      start: Temporal.ZonedDateTime.from('2026-04-09T09:00:00+00:00[UTC]'),
      end: Temporal.ZonedDateTime.from('2026-04-09T10:00:00+00:00[UTC]'),
    };

    const { container } = render(
      <CalendarEvent
        event={timedEvent}
        viewType={ViewType.DAY}
        calendarRef={calendarRef}
        hourHeight={60}
        firstHour={0}
        onMoveStart={jest.fn()}
        onEventUpdate={jest.fn()}
        onEventDelete={jest.fn()}
        onEventSelect={onEventSelect}
        onDetailPanelToggle={onDetailPanelToggle}
        isMobile
        enableTouch
      />
    );

    const eventElement = container.querySelector(
      '[data-event-id="event-1"]'
    ) as HTMLDivElement | null;

    eventElement?.dispatchEvent(
      new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [
          {
            identifier: 1,
            target: eventElement!,
            clientX: 24,
            clientY: 24,
            pageX: 24,
            pageY: 24,
            screenX: 24,
            screenY: 24,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1,
          } as unknown as Touch,
        ],
      })
    );
    eventElement?.dispatchEvent(
      new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [
          {
            identifier: 1,
            target: eventElement!,
            clientX: 24,
            clientY: 24,
            pageX: 24,
            pageY: 24,
            screenX: 24,
            screenY: 24,
            radiusX: 1,
            radiusY: 1,
            rotationAngle: 0,
            force: 1,
          } as unknown as Touch,
        ],
      })
    );
    eventElement?.click();

    expect(onEventSelect).toHaveBeenCalledTimes(1);
    expect(onEventSelect).toHaveBeenCalledWith('event-1');
    expect(onDetailPanelToggle).toHaveBeenCalledWith(null);
    expect(onDetailPanelToggle).not.toHaveBeenCalledWith('event-1');
  });
});
