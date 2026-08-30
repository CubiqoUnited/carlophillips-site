import { cssToken } from './css-token';

export const zIndex = {
  content: cssToken('layer-content'),
  control: cssToken('layer-control'),
  header: cssToken('layer-header'),
  menu: cssToken('layer-menu'),
  dialog: cssToken('layer-dialog'),
} as const;
