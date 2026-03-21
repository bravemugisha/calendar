import { Event } from '@/types/event';
import { temporalToDate } from '@/utils/temporal';

export const getAllDayRangeMetrics = (event: Event) => {
  const startDay = temporalToDate(event.start);
  startDay.setHours(0, 0, 0, 0);

  const endDay = temporalToDate(event.end);
  endDay.setHours(0, 0, 0, 0);

  return {
    startDay,
    endDay,
    isMultiDay: endDay.getTime() > startDay.getTime(),
  };
};

/**
 * Sort all-day events alphabetically by title.
 * Exported so React consumers can pass a stable comparator reference.
 */
export const sortAllDayByTitle = (a: Event, b: Event): number =>
  a.title.localeCompare(b.title);

export const compareAllDayDisplayPriority = (
  a: Event,
  b: Event,
  comparator?: (a: Event, b: Event) => number
): number => {
  const aRange = getAllDayRangeMetrics(a);
  const bRange = getAllDayRangeMetrics(b);

  if (aRange.isMultiDay !== bRange.isMultiDay) {
    return aRange.isMultiDay ? -1 : 1;
  }

  if (aRange.isMultiDay && bRange.isMultiDay) {
    const startDiff = aRange.startDay.getTime() - bRange.startDay.getTime();
    if (startDiff !== 0) {
      return startDiff;
    }

    const endDiff = bRange.endDay.getTime() - aRange.endDay.getTime();
    if (endDiff !== 0) {
      return endDiff;
    }
  }

  if (comparator) {
    const comparatorResult = comparator(a, b);
    if (comparatorResult !== 0) {
      return comparatorResult;
    }
  }

  return aRange.startDay.getTime() - bRange.startDay.getTime();
};

export const createAllDayDisplayComparator = (
  events: Event[],
  comparator?: (a: Event, b: Event) => number
) => {
  const calendarGroupMeta = new Map<
    string | undefined,
    {
      hasMultiDay: boolean;
      earliestMultiDayStart: number;
    }
  >();

  events.forEach(event => {
    const { isMultiDay, startDay } = getAllDayRangeMetrics(event);
    const existing = calendarGroupMeta.get(event.calendarId);

    if (!existing) {
      calendarGroupMeta.set(event.calendarId, {
        hasMultiDay: isMultiDay,
        earliestMultiDayStart: isMultiDay
          ? startDay.getTime()
          : Number.POSITIVE_INFINITY,
      });
      return;
    }

    if (isMultiDay) {
      existing.hasMultiDay = true;
      existing.earliestMultiDayStart = Math.min(
        existing.earliestMultiDayStart,
        startDay.getTime()
      );
    }
  });

  return (a: Event, b: Event) => {
    const aMeta = calendarGroupMeta.get(a.calendarId);
    const bMeta = calendarGroupMeta.get(b.calendarId);

    if ((aMeta?.hasMultiDay ?? false) !== (bMeta?.hasMultiDay ?? false)) {
      return aMeta?.hasMultiDay ? -1 : 1;
    }

    if (
      (aMeta?.hasMultiDay ?? false) &&
      (bMeta?.hasMultiDay ?? false) &&
      a.calendarId !== b.calendarId
    ) {
      const groupStartDiff =
        (aMeta?.earliestMultiDayStart ?? Number.POSITIVE_INFINITY) -
        (bMeta?.earliestMultiDayStart ?? Number.POSITIVE_INFINITY);
      if (groupStartDiff !== 0) {
        return groupStartDiff;
      }
    }

    if (a.calendarId === b.calendarId) {
      return compareAllDayDisplayPriority(a, b, comparator);
    }

    return compareAllDayDisplayPriority(a, b, comparator);
  };
};
