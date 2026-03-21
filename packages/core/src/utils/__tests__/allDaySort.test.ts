import { Temporal } from 'temporal-polyfill';

import { organizeAllDayEvents } from '@/components/dayView/util';
import { organizeAllDaySegments } from '@/components/weekView/util';
import { sortAllDayByTitle } from '@/utils/allDaySort';

const createAllDayEvent = (
  id: string,
  calendarId: string,
  start: string,
  end: string = start
) => ({
  id,
  title: id,
  calendarId,
  allDay: true,
  start: Temporal.PlainDate.from(start),
  end: Temporal.PlainDate.from(end),
});

describe('all-day display priority', () => {
  it('keeps multi-day all-day events above single-day events in DayView by default', () => {
    const events = [
      createAllDayEvent('single', 'a-calendar', '2026-03-12'),
      createAllDayEvent('multi', 'z-calendar', '2026-03-10', '2026-03-14'),
    ];

    const organized = organizeAllDayEvents(events);

    expect(organized.find(event => event.id === 'multi')?.row).toBe(0);
    expect(organized.find(event => event.id === 'single')?.row).toBe(1);
  });

  it('keeps earlier multi-day all-day events above later ones in WeekView by default', () => {
    const events = [
      createAllDayEvent('later', 'a-calendar', '2026-03-11', '2026-03-13'),
      createAllDayEvent('earlier', 'z-calendar', '2026-03-10', '2026-03-14'),
      createAllDayEvent('single', 'm-calendar', '2026-03-12'),
    ];

    const organized = organizeAllDaySegments(
      events,
      new Date('2026-03-09T00:00:00'),
      7
    );

    expect(organized.find(segment => segment.event.id === 'earlier')?.row).toBe(
      0
    );
    expect(organized.find(segment => segment.event.id === 'later')?.row).toBe(
      1
    );
    expect(organized.find(segment => segment.event.id === 'single')?.row).toBe(
      2
    );
  });

  it('keeps same-calendar all-day events grouped under their multi-day event in WeekView by default', () => {
    const events = [
      createAllDayEvent('a', 'z-calendar', '2026-03-12', '2026-03-15'),
      createAllDayEvent('b', 'a-calendar', '2026-03-12'),
      createAllDayEvent('c', 'z-calendar', '2026-03-12'),
    ];

    const organized = organizeAllDaySegments(
      events,
      new Date('2026-03-09T00:00:00'),
      7
    );

    expect(organized.find(segment => segment.event.id === 'a')?.row).toBe(0);
    expect(organized.find(segment => segment.event.id === 'c')?.row).toBe(1);
    expect(organized.find(segment => segment.event.id === 'b')?.row).toBe(2);
  });

  it('lets title sorting override multi-day priority when using sortAllDayByTitle', () => {
    const events = [
      {
        ...createAllDayEvent('zulu', 'work', '2026-03-12', '2026-03-14'),
        title: 'Zulu',
      },
      {
        ...createAllDayEvent('alpha', 'work', '2026-03-12'),
        title: 'Alpha',
      },
    ];

    const organized = organizeAllDayEvents(events, sortAllDayByTitle);

    expect(organized.find(event => event.id === 'alpha')?.row).toBe(0);
    expect(organized.find(event => event.id === 'zulu')?.row).toBe(1);
  });
});
