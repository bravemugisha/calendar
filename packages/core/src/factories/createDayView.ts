// Factory function for creating Day view
import { h } from 'preact';

import {
  DayViewConfig,
  DayViewProps,
  ViewAdapterProps,
  ViewFactory,
  ViewType,
} from '@/types';
import DayView from '@/views/DayView';

import { ViewAdapter } from './ViewAdapter';

// Default Day view configuration
const defaultDayViewConfig: DayViewConfig = {
  // Day view specific configuration
};

// Stable adapter component
const DayViewAdapter = (props: DayViewProps) =>
  h(ViewAdapter, {
    ...(props as ViewAdapterProps),
    viewType: ViewType.DAY,
    originalComponent: DayView,
    className: 'day-view-factory',
  });

DayViewAdapter.displayName = 'DayViewAdapter';

// Day view factory function
export const createDayView: ViewFactory<DayViewConfig> = (config = {}) => {
  // Merge configuration
  const finalConfig = { ...defaultDayViewConfig, ...config };

  return {
    type: ViewType.DAY,
    component: DayViewAdapter,
    config: finalConfig,
  };
};

export default createDayView;
