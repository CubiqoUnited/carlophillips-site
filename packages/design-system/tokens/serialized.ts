export const serializedColors = {
  canvas: '#000000',
  canvasDeep: '#020202',
  ink: '#ffffff',
  copySoft: 'rgba(255,255,255,0.58)',
} as const;

export const serializedTypography = {
  sans: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  light: 300,
  regular: 400,
} as const;

export const serializedOpenGraph = {
  padding: 64,
  ruleWidth: 1,
} as const;

/**
 * Serializable values for Next ImageResponse. CSS custom properties are not
 * available in the edge image renderer, so this is the one typed adapter from
 * the canonical design-token package into that constrained surface.
 */
export const openGraphTokens = {
  padding: serializedOpenGraph.padding,
  fontFamily: serializedTypography.sans,
  labelSize: 18,
  labelTracking: '0.3em',
  displaySize: 96,
  displayLeading: 0.9,
  displayTracking: '-0.04em',
  noteSize: 20,
} as const;
