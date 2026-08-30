import { cssToken } from './css-token';

export const typography = {
  sans: cssToken('font-sans'),
  editorial: cssToken('font-editorial'),
  mono: cssToken('font-mono'),
  body: cssToken('size-body'),
  bodyLarge: cssToken('size-body-large'),
  productHeading: cssToken('size-heading-product'),
  sectionHeading: cssToken('size-heading-section'),
} as const;
