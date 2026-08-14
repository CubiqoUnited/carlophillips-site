import { cssToken } from './css-token';

export const radii = {
  none: cssToken('radius-none'),
  small: cssToken('radius-small'),
  medium: cssToken('radius-medium'),
  large: cssToken('radius-large'),
  full: cssToken('radius-full'),
} as const;
