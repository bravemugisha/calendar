import {
  Event,
  createDateWithHour,
  dateToPlainDate,
  dateToZonedDateTime,
  temporalToDate,
} from '@dayflow/core';

type WeekDayFinalizeDragLike = {
  allDay: boolean;
  endHour: number;
  mode?: 'create' | 'move' | 'resize' | null;
  originalEndDate?: Date | null;
  originalStartDate?: Date | null;
  resizeDirection?: string | null;
  startHour: number;
};

type WeekDayCreateDragLike = {
  allDay: boolean;
  dayIndex: number;
};

type WeekDayDropDragLike = {
  allDay: boolean;
  dayIndex: number;
  mode?: 'move' | 'resize' | null;
  originalEndDate?: Date | null;
  originalEvent?: Event | null;
  originalStartDate?: Date | null;
};

export const finalizeWeekDayDragHours = ({
  drag,
  getEffectiveDaySpan,
  minDuration,
  roundToTimeStep,
}: {
  drag: WeekDayFinalizeDragLike;
  getEffectiveDaySpan: (start: Date, end: Date, isAllDay?: boolean) => number;
  minDuration: number;
  roundToTimeStep: (value: number) => number;
}) => {
  const hasCrossDayTimedResize =
    !drag.allDay &&
    drag.mode === 'resize' &&
    !!drag.originalStartDate &&
    !!drag.originalEndDate &&
    getEffectiveDaySpan(drag.originalStartDate, drag.originalEndDate, false) >
      0;

  let finalStartHour = roundToTimeStep(drag.startHour);
  let finalEndHour = roundToTimeStep(drag.endHour);

  if (!hasCrossDayTimedResize && finalEndHour - finalStartHour < minDuration) {
    if (drag.resizeDirection === 'top') {
      finalStartHour = finalEndHour - minDuration;
    } else {
      finalEndHour = finalStartHour + minDuration;
    }
  }

  return {
    finalEndHour,
    finalStartHour,
    hasCrossDayTimedResize,
  };
};

export const buildWeekDayCreateEvent = ({
  appTimeZone,
  currentWeekStart,
  drag,
  finalEndHour,
  finalStartHour,
  getDateByDayIndex,
  title,
  writableCalendarId,
}: {
  appTimeZone: string;
  currentWeekStart?: Date;
  drag: WeekDayCreateDragLike;
  finalEndHour: number;
  finalStartHour: number;
  getDateByDayIndex: (weekStart: Date, dayIndex: number) => Date;
  title: string;
  writableCalendarId: string;
}): Event => {
  const eventDate = currentWeekStart
    ? getDateByDayIndex(currentWeekStart, drag.dayIndex)
    : new Date();
  const startDate = createDateWithHour(eventDate, finalStartHour) as Date;
  const endDate = createDateWithHour(eventDate, finalEndHour) as Date;

  return {
    id: String(Date.now()),
    title,
    day: drag.dayIndex,
    start: drag.allDay
      ? dateToPlainDate(startDate)
      : dateToZonedDateTime(startDate, appTimeZone),
    end: drag.allDay
      ? dateToPlainDate(endDate)
      : dateToZonedDateTime(endDate, appTimeZone),
    calendarId: writableCalendarId,
    allDay: drag.allDay,
  };
};

export const buildWeekDayDropEvent = ({
  appTimeZone,
  canonicalizeEditedEvent,
  currentWeekStart,
  drag,
  finalEndHour,
  finalStartHour,
  getDateByDayIndex,
  originalEvent,
}: {
  appTimeZone: string;
  canonicalizeEditedEvent: (originalEvent: Event, visualEvent: Event) => Event;
  currentWeekStart?: Date;
  drag: WeekDayDropDragLike;
  finalEndHour: number;
  finalStartHour: number;
  getDateByDayIndex: (weekStart: Date, dayIndex: number) => Date;
  originalEvent: Event;
}): Event => {
  if (drag.allDay) {
    const newStart = dateToPlainDate(
      drag.originalStartDate || temporalToDate(originalEvent.start)
    );
    const newEnd = dateToPlainDate(
      drag.originalEndDate || temporalToDate(originalEvent.end)
    );

    return {
      ...originalEvent,
      day: drag.dayIndex,
      start: newStart,
      end: newEnd,
      allDay: true,
    };
  }

  const eventStartDate = temporalToDate(originalEvent.start);
  const startDateObj =
    drag.mode === 'resize' && drag.originalStartDate
      ? new Date(drag.originalStartDate)
      : ((currentWeekStart
          ? createDateWithHour(
              getDateByDayIndex(currentWeekStart, drag.dayIndex),
              finalStartHour
            )
          : createDateWithHour(eventStartDate, finalStartHour)) as Date);
  const endDateObj =
    drag.mode === 'resize' && drag.originalEndDate
      ? new Date(drag.originalEndDate)
      : ((currentWeekStart
          ? createDateWithHour(
              getDateByDayIndex(currentWeekStart, drag.dayIndex),
              finalEndHour
            )
          : createDateWithHour(eventStartDate, finalEndHour)) as Date);

  return canonicalizeEditedEvent(originalEvent, {
    ...originalEvent,
    day: drag.dayIndex,
    start: dateToZonedDateTime(startDateObj, appTimeZone),
    end: dateToZonedDateTime(endDateObj, appTimeZone),
    allDay: false,
  });
};
