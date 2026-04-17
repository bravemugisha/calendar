import { fireEvent, render, screen } from '@testing-library/preact';

import { QuickCreateEventPopup } from '@/components/common/QuickCreateEventPopup';
import { CalendarApp } from '@/core/CalendarApp';
import { ViewType } from '@/types';

const createApp = () =>
  new CalendarApp({
    views: [],
    plugins: [],
    defaultView: ViewType.MONTH,
    events: [],
    calendars: [
      {
        id: 'work',
        name: 'Work',
        colors: {
          lineColor: '#2563eb',
          eventColor: '#dbeafe',
          eventSelectedColor: '#bfdbfe',
          textColor: '#1e3a8a',
        },
      },
    ],
    defaultCalendar: 'work',
    timeZone: 'Australia/Sydney',
  });

describe('QuickCreateEventPopup', () => {
  it('creates an event from the keyboard suggestion flow', () => {
    const app = createApp();
    const onClose = jest.fn();
    const anchor = document.createElement('div');

    Object.defineProperty(anchor, 'getBoundingClientRect', {
      value: () => ({
        top: 120,
        left: 160,
        right: 200,
        bottom: 152,
        width: 40,
        height: 32,
        x: 160,
        y: 120,
        toJSON: () => ({}),
      }),
    });

    document.body.append(anchor);

    render(
      <QuickCreateEventPopup
        app={app}
        anchorRef={{ current: anchor }}
        onClose={onClose}
        isOpen
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'Plan review' } });
    fireEvent.keyDown(window, { key: 'Enter' });

    const createdEvent = app
      .getEvents()
      .find(event => event.title === 'Plan review');

    expect(createdEvent).toBeDefined();
    expect(createdEvent?.calendarId).toBe('work');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
