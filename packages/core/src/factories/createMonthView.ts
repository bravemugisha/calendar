// Factory function for creating Month view
import { h } from 'preact';

import {
  MonthViewConfig,
  MonthViewProps,
  ViewAdapterProps,
  ViewFactory,
  ViewType,
} from '@/types';
import MonthView from '@/views/MonthView';

import { ViewAdapter } from './ViewAdapter';

// Default Month view configuration
const defaultMonthViewConfig: MonthViewConfig = {
  // Month view specific configuration
  showWeekNumbers: false,
  showMonthIndicator: true,
  startOfWeek: 1, // Monday
};

// Stable adapter component
const MonthViewAdapter = (props: MonthViewProps) =>
  h(ViewAdapter, {
    ...(props as ViewAdapterProps),
    viewType: ViewType.MONTH,
    originalComponent: MonthView,
    className: 'df-month-view-factory',
  });

MonthViewAdapter.displayName = 'MonthViewAdapter';

// Month view factory function
export const createMonthView: ViewFactory<MonthViewConfig> = (config = {}) => {
  // Merge configuration
  const finalConfig = { ...defaultMonthViewConfig, ...config };

  return {
    type: ViewType.MONTH,
    component: MonthViewAdapter,
    config: finalConfig,
  };
};

export default createMonthView;
