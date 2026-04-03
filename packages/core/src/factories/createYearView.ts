// Factory function for creating Year view
import { h } from 'preact';

import {
  ViewAdapterProps,
  ViewFactory,
  ViewType,
  YearViewConfig,
  YearViewProps,
} from '@/types';
import YearView from '@/views/YearView';

import { ViewAdapter } from './ViewAdapter';

// Default Year view configuration
const defaultYearViewConfig: YearViewConfig = {
  // Year view specific configuration
};

// Stable adapter component
const YearViewAdapter = (props: YearViewProps) =>
  h(ViewAdapter, {
    ...(props as ViewAdapterProps),
    viewType: ViewType.YEAR,
    originalComponent: YearView,
    className: 'year-view-factory',
  });

YearViewAdapter.displayName = 'YearViewAdapter';

// Year view factory function
export const createYearView: ViewFactory<YearViewConfig> = (config = {}) => {
  // Merge configuration
  const finalConfig = { ...defaultYearViewConfig, ...config };

  return {
    type: ViewType.YEAR,
    component: YearViewAdapter,
    config: finalConfig,
  };
};

export default createYearView;
