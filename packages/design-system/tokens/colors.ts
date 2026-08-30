import { cssToken } from './css-token';

export const colors = {
  canvas: cssToken('color-canvas'),
  canvasDeep: cssToken('color-canvas-deep'),
  panel: cssToken('color-panel'),
  ink: cssToken('color-ink'),
  copy: cssToken('color-copy'),
  copyStrong: cssToken('color-copy-strong'),
  copySoft: cssToken('color-copy-soft'),
  rule: cssToken('color-rule'),
  focus: cssToken('color-rule-focus'),
} as const;
