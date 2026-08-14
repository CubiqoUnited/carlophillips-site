import { cssToken } from './css-token';

export const motion = {
  standard: cssToken('duration-standard'),
  image: cssToken('duration-image'),
  campaign: cssToken('duration-campaign'),
  easing: cssToken('ease-standard'),
} as const;
