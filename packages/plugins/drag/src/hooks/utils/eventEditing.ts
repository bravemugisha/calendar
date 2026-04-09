import {
  Event,
  ICalendarApp,
  dateToZonedDateTime,
  extractHourFromDate,
  getEventEndHour,
  restoreVisualEventToCanonical,
  temporalToVisualDate,
} from '@dayflow/core';
import { Temporal } from 'temporal-polyfill';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface TimedEventHoursForEditing {
  startDate: Date;
  endDate: Date;
  startHour: number;
  endHour: number;
}

export const getAppTimeZone = (app?: ICalendarApp | null) => {
  if (!app) return Temporal.Now.timeZoneId();

  const appWithTimeZone = app as typeof app & {
    timeZone?: string;
    state?: { timeZone?: string };
  };

  return (
    appWithTimeZone.timeZone ??
    appWithTimeZone.state?.timeZone ??
    Temporal.Now.timeZoneId()
  );
};

export const getEventDateForEditing = (
  temporal: Event['start'],
  appTimeZone: string
) => temporalToVisualDate(temporal, appTimeZone);

export const canonicalizeEditedEvent = (
  originalEvent: Event,
  visualEvent: Event,
  appTimeZone: string
): Event =>
  restoreVisualEventToCanonical(originalEvent, visualEvent, appTimeZone);

export const getTimedEventHoursForEditing = (
  event: Event,
  appTimeZone: string
): TimedEventHoursForEditing => {
  const startDate = getEventDateForEditing(event.start, appTimeZone);
  const endDate = getEventDateForEditing(event.end ?? event.start, appTimeZone);

  return {
    startDate,
    endDate,
    startHour: extractHourFromDate(startDate),
    endHour: getEventEndHour({
      ...event,
      start: dateToZonedDateTime(startDate, appTimeZone),
      end: dateToZonedDateTime(endDate, appTimeZone),
    }),
  };
};

export const getEffectiveDaySpan = (
  start: Date,
  end: Date,
  isAllDay: boolean = false
): number => {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  let span = Math.floor((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);
  if (span <= 0) return 0;

  if (!isAllDay && span === 1) {
    const isMidnightEnd =
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getSeconds() === 0 &&
      end.getMilliseconds() === 0;
    const durationMs = end.getTime() - start.getTime();
    if (isMidnightEnd && durationMs < DAY_IN_MS) {
      return 0;
    }
  }

  return span;
};

export const getDayIndexForDate = (
  currentWeekStart: Date | undefined,
  date: Date,
  fallback: number = 0
): number => {
  if (!currentWeekStart) return fallback;

  const start = new Date(currentWeekStart);
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.floor((target.getTime() - start.getTime()) / DAY_IN_MS);
};
