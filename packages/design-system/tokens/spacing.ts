import { cssToken } from './css-token';

export const spacing = {
  xs: cssToken('space-2'),
  sm: cssToken('space-4'),
  md: cssToken('space-8'),
  lg: cssToken('space-16'),
  xl: cssToken('space-24'),
  pageGutter: cssToken('page-gutter'),
  section: cssToken('section-space'),
} as const;
