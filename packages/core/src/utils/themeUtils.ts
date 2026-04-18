/**
 * Theme Utility Functions
 *
 * This module provides utility functions for working with theme-aware class names.
 */

/**
 * Combine class names with theme-specific variants.
 * @deprecated Use semantic df-* classes instead, which handle theme via CSS variables.
 *
 * @param base - Base class names (applied in both themes)
 * @param light - Light mode specific class names
 * @param dark - Dark mode specific class names (will be prefixed with 'dark:')
 * @returns Combined class name string
 */
export const themeCn = (base: string, light: string, dark: string): string => {
  if (dark.includes('df-')) {
    // If using semantic classes, just merge them
    return `${base} ${light} ${dark}`.trim();
  }

  const darkClasses = dark
    .split(' ')
    .filter(Boolean)
    .map(cls => (cls.startsWith('df-') ? cls : 'dark:' + cls))
    .join(' ');

  return `${base} ${light} ${darkClasses}`.trim();
};

/**
 * Common theme class combinations
 *
 * Pre-defined semantic class combinations for common UI elements.
 * All values now use df-* semantic classes that are theme-aware.
 */
export const themeClasses = {
  // Container styles
  container: 'df-bg-base',
  card: 'df-bg-card',
  sidebar: 'df-bg-sidebar',

  // Text colors
  text: 'df-text-primary',
  textMuted: 'df-text-muted',
  textSubtle: 'df-text-muted',
  textEmphasis: 'df-text-primary',

  // Border colors
  border: 'df-border-base',
  borderLight: 'df-border-light',
  borderStrong: 'df-border-strong',

  // Background colors
  bgPrimary: 'df-bg-base',
  bgSecondary: 'df-bg-secondary',
  bgTertiary: 'df-bg-tertiary',
  bgMuted: 'df-bg-secondary',

  // Interactive states
  hover: 'df-hover-base',
  hoverSubtle: 'df-hover-muted',
  active: 'df-bg-secondary',
  focus: 'df-focus-ring-only',

  // Input styles
  input: 'df-bg-base df-border-base df-text-primary',
  inputFocus: 'df-focus-ring',

  // Button styles
  buttonPrimary: 'df-fill-primary df-hover-primary-solid',
  buttonSecondary: 'df-bg-secondary df-text-primary df-hover-base',
  buttonDanger: 'df-fill-destructive df-hover-destructive',
  buttonSuccess: 'df-fill-secondary df-hover-base', // Success is mapped to secondary for now

  // Shadow
  shadow: 'df-shadow-sm',
  shadowMd: 'df-shadow-md',
  shadowLg: 'df-shadow-md', // Mapped to md for now

  // Divider
  divider: 'df-border-base',
};

/**
 * Conditional theme class
 *
 * Returns different class names based on a condition.
 *
 * @param condition - Condition to evaluate
 * @param whenTrue - Class names when condition is true
 * @param whenFalse - Class names when condition is false
 * @returns Class name string based on condition
 */
export const conditionalTheme = (
  condition: boolean,
  whenTrue: string,
  whenFalse: string
): string => (condition ? whenTrue : whenFalse);

/**
 * Merge multiple class names, filtering out falsy values
 *
 * @param classes - Array of class names or falsy values
 * @returns Merged class name string
 */
export const mergeClasses = (
  ...classes: (string | undefined | null | false)[]
): string => classes.filter(Boolean).join(' ');

/**
 * Resolve the currently applied theme on the document.
 */
export const resolveAppliedTheme = (
  effectiveTheme: 'light' | 'dark'
): 'light' | 'dark' => {
  if (typeof document === 'undefined') {
    return effectiveTheme;
  }

  const root = document.documentElement;

  const overrideAttributes = [
    root.dataset.dfThemeOverride,
    root.dataset.dfTheme,
    root.dataset.theme,
  ];

  for (const attr of overrideAttributes) {
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }
  }

  if (root.classList.contains('dark')) {
    return 'dark';
  }

  if (root.classList.contains('light')) {
    return 'light';
  }

  return effectiveTheme;
};
