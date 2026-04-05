import { CalendarRegistry } from '@/core/calendarRegistry';
import { Event, ReadOnlyConfig } from '@/types';

/**
 * Compute the effective draggable/viewable flags for a given event or calendar ID,
 * taking into account global readOnly config, per-calendar readOnly, and subscription status.
 */
export function getReadOnlyConfig(
  readOnly: boolean | ReadOnlyConfig,
  id: string | undefined,
  registry: CalendarRegistry,
  events: Event[]
): ReadOnlyConfig {
  let draggable = true;
  let viewable = true;

  if (readOnly === true) {
    draggable = false;
    viewable = false;
  } else if (readOnly !== false) {
    draggable = (readOnly as ReadOnlyConfig).draggable ?? true;
    viewable = (readOnly as ReadOnlyConfig).viewable ?? true;
  }

  if (id && (draggable || viewable)) {
    let calendarId = id;
    const event = events.find(e => e.id === id);
    if (event?.calendarId) calendarId = event.calendarId;

    const calendar = registry.get(calendarId);
    if (calendar) {
      if (calendar.readOnly === true) {
        draggable = false;
      }
      if (calendar.subscription && calendar.readOnly === undefined) {
        draggable = false;
      }
    }
  }

  return { draggable, viewable };
}

/**
 * Returns true if the given event or calendar ID allows UI mutations
 * (drag, resize, edit). Respects global readOnly, per-calendar readOnly,
 * and subscription status.
 */
export function canMutateFromUI(
  readOnly: boolean | ReadOnlyConfig,
  id: string | undefined,
  registry: CalendarRegistry,
  events: Event[]
): boolean {
  if (readOnly !== false) return false;

  if (id) {
    let calendarId = id;
    const event = events.find(e => e.id === id);
    if (event?.calendarId) calendarId = event.calendarId;

    const calendar = registry.get(calendarId);
    if (calendar) {
      if (calendar.readOnly !== undefined) return !calendar.readOnly;
      if (calendar.subscription) return false;
    }
  }

  return true;
}
