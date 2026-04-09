import { Event, EventLayout } from '@dayflow/core';

export const buildWeekDayDragLayout = ({
  calculateDragLayout,
  dayIndex,
  endHour,
  eventId,
  events,
  roundToTimeStep,
  startHour,
}: {
  calculateDragLayout?: (
    event: Event,
    dayIndex: number,
    startHour: number,
    endHour: number
  ) => EventLayout | null;
  dayIndex: number;
  endHour: number;
  eventId?: string | null;
  events?: Event[];
  roundToTimeStep: (value: number) => number;
  startHour: number;
}): EventLayout | null => {
  if (!eventId || !calculateDragLayout) return null;

  const draggedEvent = events?.find(target => target.id === eventId);
  if (!draggedEvent) return null;

  return calculateDragLayout(
    draggedEvent,
    dayIndex,
    roundToTimeStep(startHour),
    roundToTimeStep(endHour)
  );
};
