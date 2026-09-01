/*
 * Browser and metadata serializers cannot resolve CSS custom properties in
 * media conditions, image `sizes`, viewport metadata, or ImageResponse style
 * objects. These mirrors are the only permitted runtime literals. Tests bind
 * them back to app/design-tokens.css so CSS remains the canonical authority.
 */
export const designSystemRuntimeContract = Object.freeze({
  breakpoints: Object.freeze({
    smallPx: 640,
    tabletPx: 768,
    desktopPx: 1024,
    widePx: 1280,
  }),
  media: Object.freeze({
    darkScheme: '(prefers-color-scheme: dark)',
    desktopMin: '(min-width: 1024px)',
    lightScheme: '(prefers-color-scheme: light)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
    tabletMax: '(max-width: 767px)',
    tabletMin: '(min-width: 768px)',
    wideMin: '(min-width: 1280px)',
  }),
  imageSizes: Object.freeze({
    catalogFeatured: '(min-width: 1024px) 68vw, 100vw',
    catalogStandard: '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw',
    conceptCard: '(min-width: 1024px) 33vw, 100vw',
    discoveryThumb: '6rem',
    fullViewport: '100vw',
    galleryAsset: '90vw',
    productDetail: '(min-width: 1024px) 52vw, 100vw',
    productPanel: '(min-width: 1024px) 58vw, 100vw',
    productStage: '(min-width: 1024px) 38vw, 100vw',
  }),
  behavior: Object.freeze({
    galleryAutoplayMs: 5000,
    instantScroll: 'auto',
    scrollBlockStart: 'start',
    smoothScroll: 'smooth',
  }),
  theme: Object.freeze({
    canvas: '#000000',
  }),
  viewport: Object.freeze({
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  }),
  openGraph: Object.freeze({
    size: Object.freeze({ width: 1200, height: 630 }),
    canvas: Object.freeze({
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: '#020202',
      color: '#ffffff',
      padding: 72,
      fontFamily: 'Arial',
    }),
    wordmark: Object.freeze({ fontSize: 22, letterSpacing: 8 }),
    title: Object.freeze({
      display: 'flex',
      flexDirection: 'column',
      fontSize: 132,
      lineHeight: 0.9,
      letterSpacing: -8,
    }),
    status: Object.freeze({ fontSize: 24, color: 'rgba(255,255,255,0.62)' }),
  }),
});
