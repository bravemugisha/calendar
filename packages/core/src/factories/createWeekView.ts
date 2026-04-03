// Factory function for creating Week view
import { h } from 'preact';

import {
  ViewAdapterProps,
  ViewFactory,
  ViewType,
  WeekViewConfig,
  WeekViewProps,
} from '@/types';
import WeekView from '@/views/WeekView';

import { ViewAdapter } from './ViewAdapter';

// Default Week view configuration
const defaultWeekViewConfig: WeekViewConfig = {
  // Week view specific configuration
  startOfWeek: 1, // Monday
};

// Stable adapter component
const WeekViewAdapter = (props: WeekViewProps) =>
  h(ViewAdapter, {
    ...(props as ViewAdapterProps),
    viewType: ViewType.WEEK,
    originalComponent: WeekView,
    className: 'week-view-factory',
  });

WeekViewAdapter.displayName = 'WeekViewAdapter';

// Week view factory function
export const createWeekView: ViewFactory<WeekViewConfig> = (config = {}) => {
  // Merge configuration
  const finalConfig = { ...defaultWeekViewConfig, ...config };

  return {
    type: ViewType.WEEK,
    component: WeekViewAdapter,
    config: finalConfig,
  };
};

export default createWeekView;
