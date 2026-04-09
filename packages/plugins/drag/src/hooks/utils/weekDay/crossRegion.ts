import {
  Event,
  WeekDayDragState,
  createDateWithHour,
  dateToPlainDate,
  dateToZonedDateTime,
  getDateByDayIndex,
  getEndOfDay,
  restoreTimedDragFromAllDayTransition,
  temporalToDate,
} from '@dayflow/core';

type CrossRegionMoveDragLike = {
  allDay: boolean;
  dayIndex: number;
  duration: number;
  endHour: number;
  eventId?: string | null;
  eventDate?: Date;
  hourOffset?: number | null;
  originalEndHour: number;
  originalEvent?: Event | null;
  originalStartHour: number;
  startHour: number;
};

type BuildCrossRegionAllDayPreviewParams = {
  currentWeekStart?: Date;
  drag: CrossRegionMoveDragLike;
  newDayIndex: number;
};

type BuildCrossRegionTimedPreviewParams = {
  currentWeekStart?: Date;
  drag: CrossRegionMoveDragLike;
  firstHour: number;
  lastHour: number;
  mouseHour: number;
  newDayIndex: number;
  roundToTimeStep: (value: number) => number;
  timeStep: number;
};

type UniversalMoveDropDragLike = {
  allDay: boolean;
  dayIndex: number;
  endHour: number;
  eventDurationDays?: number;
  originalDay: number;
  originalEvent?: Event | null;
  originalStartDate?: Date | null;
  startDragDayIndex?: number;
  startHour: number;
};

type BuildUniversalMoveDropResultParams = {
  appTimeZone: string;
  canonicalizeEditedEvent: (originalEvent: Event, visualEvent: Event) => Event;
  currentWeekStart?: Date;
  drag: UniversalMoveDropDragLike;
  getEffectiveDaySpan: (start: Date, end: Date, isAllDay?: boolean) => number;
  minDuration: number;
  roundToTimeStep: (value: number) => number;
  targetEvent: Event;
};

export const shouldActivateUniversalMoveIndicator = ({
  clientX,
  clientY,
  startX,
  startY,
}: {
  clientX: number;
  clientY: number;
  startX: number;
  startY: number;
}) => Math.hypot(clientX - startX, clientY - startY) >= 3;

export const buildCrossRegionAllDayPreview = ({
  currentWeekStart,
  drag,
  newDayIndex,
}: BuildCrossRegionAllDayPreviewParams): {
  dragState: WeekDayDragState;
  dragUpdates: Partial<CrossRegionMoveDragLike>;
} => ({
  dragState: {
    active: true,
    mode: 'move',
    eventId: drag.eventId ?? null,
    dayIndex: newDayIndex,
    startHour: 0,
    endHour: 0,
    allDay: true,
  },
  dragUpdates: {
    allDay: true,
    dayIndex: newDayIndex,
    startHour: 0,
    endHour: 0,
    eventDate: currentWeekStart
      ? getDateByDayIndex(currentWeekStart, newDayIndex)
      : new Date(),
  },
});

export const buildCrossRegionTimedPreview = ({
  currentWeekStart,
  drag,
  firstHour,
  lastHour,
  mouseHour,
  newDayIndex,
  roundToTimeStep,
  timeStep,
}: BuildCrossRegionTimedPreviewParams): {
  dragState: WeekDayDragState;
  dragUpdates: Partial<CrossRegionMoveDragLike>;
} => {
  if (drag.allDay) {
    const restoredTimedDrag = restoreTimedDragFromAllDayTransition({
      wasOriginallyAllDay: drag.originalEvent?.allDay ?? false,
      mouseHour,
      hourOffset: drag.hourOffset,
      duration: drag.duration,
      originalStartHour: drag.originalStartHour,
      originalEndHour: drag.originalEndHour,
      firstHour,
      lastHour,
      minDuration: timeStep,
      roundToTimeStep,
    });

    return {
      dragState: {
        active: true,
        mode: 'move',
        eventId: drag.eventId ?? null,
        dayIndex: newDayIndex,
        startHour: roundToTimeStep(restoredTimedDrag.startHour),
        endHour: roundToTimeStep(restoredTimedDrag.endHour),
        allDay: false,
      },
      dragUpdates: {
        allDay: false,
        dayIndex: newDayIndex,
        startHour: restoredTimedDrag.startHour,
        endHour: restoredTimedDrag.endHour,
        duration: restoredTimedDrag.duration,
        hourOffset: restoredTimedDrag.hourOffset,
        eventDate: currentWeekStart
          ? getDateByDayIndex(currentWeekStart, newDayIndex)
          : new Date(),
      },
    };
  }

  let newStartHour = roundToTimeStep(mouseHour + (drag.hourOffset ?? 0));
  newStartHour = Math.max(
    firstHour,
    Math.min(lastHour - drag.duration, newStartHour)
  );

  return {
    dragState: {
      active: true,
      mode: 'move',
      eventId: drag.eventId ?? null,
      dayIndex: newDayIndex,
      startHour: roundToTimeStep(newStartHour),
      endHour: roundToTimeStep(newStartHour + drag.duration),
      allDay: false,
    },
    dragUpdates: {
      allDay: false,
      dayIndex: newDayIndex,
      startHour: newStartHour,
      endHour: newStartHour + drag.duration,
      eventDate: currentWeekStart
        ? getDateByDayIndex(currentWeekStart, newDayIndex)
        : new Date(),
    },
  };
};

export const buildUniversalMoveDropResult = ({
  appTimeZone,
  canonicalizeEditedEvent,
  currentWeekStart,
  drag,
  getEffectiveDaySpan,
  minDuration,
  roundToTimeStep,
  targetEvent,
}: BuildUniversalMoveDropResultParams): {
  originalEvent: Event;
  updatedEvent: Event;
} => {
  let finalStartHour = drag.startHour;
  let finalEndHour = drag.endHour;

  if (!drag.allDay) {
    finalStartHour = roundToTimeStep(drag.startHour);
    finalEndHour = roundToTimeStep(drag.endHour);
    if (finalEndHour - finalStartHour < minDuration) {
      finalEndHour = finalStartHour + minDuration;
    }
  }

  const startDragDay = drag.startDragDayIndex ?? drag.originalDay;
  const dayOffset = drag.dayIndex - startDragDay;
  const newDay = drag.originalDay + dayOffset;

  let visualEvent: Event;

  if (drag.allDay) {
    const originalStartDate = drag.originalStartDate
      ? new Date(drag.originalStartDate)
      : temporalToDate(targetEvent.start);
    originalStartDate.setHours(0, 0, 0, 0);

    const newStartDate = new Date(originalStartDate);
    newStartDate.setDate(newStartDate.getDate() + dayOffset);

    const newEndDate = new Date(newStartDate);
    if (drag.eventDurationDays && drag.eventDurationDays > 0) {
      newEndDate.setDate(newEndDate.getDate() + drag.eventDurationDays);
    }

    visualEvent = {
      ...targetEvent,
      day: newDay,
      start: dateToPlainDate(newStartDate),
      end: dateToPlainDate(getEndOfDay(newEndDate) as Date),
      allDay: true,
    };
  } else {
    const originalStart = temporalToDate(targetEvent.start);
    const originalEnd = temporalToDate(targetEvent.end);
    const isOriginallyMultiDay =
      getEffectiveDaySpan(
        originalStart,
        originalEnd,
        targetEvent.allDay ?? false
      ) > 0;

    if (isOriginallyMultiDay && !targetEvent.allDay) {
      const newStartDate = new Date(originalStart);
      newStartDate.setDate(newStartDate.getDate() + dayOffset);

      const newEndDate = new Date(originalEnd);
      newEndDate.setDate(newEndDate.getDate() + dayOffset);

      visualEvent = {
        ...targetEvent,
        day: newDay,
        start: dateToZonedDateTime(newStartDate, appTimeZone),
        end: dateToZonedDateTime(newEndDate, appTimeZone),
        allDay: false,
      };
    } else {
      const newEventDate = currentWeekStart
        ? getDateByDayIndex(currentWeekStart, drag.dayIndex)
        : new Date();

      const startDateObj = createDateWithHour(
        newEventDate,
        finalStartHour
      ) as Date;
      const endDateObj = createDateWithHour(newEventDate, finalEndHour) as Date;

      visualEvent = {
        ...targetEvent,
        day: newDay,
        start: dateToZonedDateTime(startDateObj, appTimeZone),
        end: dateToZonedDateTime(endDateObj, appTimeZone),
        allDay: false,
      };
    }
  }

  return {
    originalEvent: drag.originalEvent || targetEvent,
    updatedEvent: canonicalizeEditedEvent(targetEvent, visualEvent),
  };
};
