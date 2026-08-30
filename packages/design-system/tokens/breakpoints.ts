export const breakpoints = {
  compact: 520,
  tablet: 640,
  desktop: 1024,
} as const;

// CSS custom properties cannot drive media-query boundaries. These named
// numeric contracts are the documented design-token exception.
