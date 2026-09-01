const semanticColors = {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
};

module.exports = {
  darkMode: ['class'],
  theme: {
    colors: semanticColors,
    borderRadius: {
      none: 'var(--cp-radius-none)',
      small: 'var(--cp-radius-small)',
      medium: 'var(--cp-radius-medium)',
      large: 'var(--cp-radius-large)',
      full: 'var(--cp-radius-full)',
    },
    fontFamily: {
      sans: ['var(--cp-font-sans)'],
      editorial: ['var(--cp-font-editorial)'],
      mono: ['var(--cp-font-mono)'],
    },
    fontSize: {
      label: 'var(--cp-size-label)',
      body: 'var(--cp-size-body)',
      'body-large': 'var(--cp-size-body-large)',
      xs: 'var(--cp-size-label-wide)',
      sm: 'var(--cp-size-copy-small)',
      base: 'var(--cp-size-body)',
      xl: 'var(--cp-size-copy-xl)',
      '2xl': 'var(--cp-size-copy-2xl)',
      product: 'var(--cp-size-heading-product)',
      section: 'var(--cp-size-heading-section)',
    },
    spacing: Object.fromEntries(
      [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '12',
        '14',
        '16',
        '20',
        '24',
        '28',
        '32',
        '36',
      ].map((step) => [
        step,
        step === '0' ? 'var(--cp-radius-none)' : `var(--cp-space-${step})`,
      ])
    ),
    maxWidth: {
      action: 'var(--cp-content-action)',
      compact: 'var(--cp-content-compact)',
      copy: 'var(--cp-copy-max)',
      medium: 'var(--cp-content-medium)',
      wide: 'var(--cp-content-wide)',
      xl: 'var(--cp-content-xl)',
      '2xl': 'var(--cp-content-2xl)',
      '3xl': 'var(--cp-content-3xl)',
      '4xl': 'var(--cp-content-4xl)',
      '5xl': 'var(--cp-content-5xl)',
    },
    minHeight: {
      control: 'var(--cp-control-size)',
      viewport: 'var(--cp-viewport-height)',
      screen: 'var(--cp-viewport-height-fallback)',
      14: 'var(--cp-space-14)',
      16: 'var(--cp-space-16)',
      32: 'var(--cp-space-32)',
    },
    height: {
      full: 'var(--cp-size-full)',
      4: 'var(--cp-space-4)',
      5: 'var(--cp-space-5)',
      12: 'var(--cp-space-12)',
      14: 'var(--cp-space-14)',
      16: 'var(--cp-space-16)',
    },
    width: {
      full: 'var(--cp-size-full)',
    },
    fontWeight: {
      light: 'var(--cp-weight-light)',
      regular: 'var(--cp-weight-regular)',
    },
    lineHeight: {
      relaxed: 'var(--cp-leading-relaxed)',
    },
  },
  plugins: [],
};
