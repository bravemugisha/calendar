// View factory module export file
export * from './createDayView';
export * from './createWeekView';
export * from './createMonthView';
export * from './createAgendaView';
export * from './createYearView';

// Import for internal use
import { createAgendaView } from './createAgendaView';
import { createDayView } from './createDayView';
import { createMonthView } from './createMonthView';
import { createWeekView } from './createWeekView';

// Convenient view creation function
export function createStandardViews(config?: {
  day?: Partial<import('@/types').DayViewConfig>;
  week?: Partial<import('@/types').WeekViewConfig>;
  month?: Partial<import('@/types').MonthViewConfig>;
  agenda?: Partial<import('@/types').AgendaViewConfig>;
}) {
  const views = [
    createDayView(config?.day),
    createWeekView(config?.week),
    createMonthView(config?.month),
  ];

  if (config?.agenda) {
    views.push(createAgendaView(config.agenda));
  }

  return views;
}
