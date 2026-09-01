const exactThemeKeys = [
  'accentColor',
  'cornerRadius',
  'baseSpacing',
  'textWeight',
];

export const cornerRadiusOptions = Object.freeze([
  '0rem',
  '0.25rem',
  '0.5rem',
  '0.75rem',
  '1rem',
]);

export const baseSpacingOptions = Object.freeze([
  '0.75rem',
  '0.875rem',
  '1rem',
  '1.125rem',
  '1.25rem',
]);

export const textWeightOptions = Object.freeze([300, 400, 500, 600]);

export const themeKeys = Object.freeze([...exactThemeKeys]);

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map(value => Number.parseInt(value, 16) / 255);
  const linear = channels.map(value => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
}

export function contrastRatio(left, right) {
  const values = [relativeLuminance(left), relativeLuminance(right)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

export function validateTheme(candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ok: false, errors: ['Theme must be an object.'], theme: null };
  }

  const keys = Object.keys(candidate).sort();
  const expectedKeys = [...exactThemeKeys].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    errors.push('Theme must contain exactly accentColor, cornerRadius, baseSpacing, and textWeight.');
  }

  if (!/^#[0-9a-f]{6}$/i.test(candidate.accentColor || '')) {
    errors.push('Accent colour must be a six-digit hexadecimal colour.');
  } else if (
    contrastRatio(candidate.accentColor, '#000000') < 4.5
    || contrastRatio(candidate.accentColor, '#020202') < 4.5
  ) {
    errors.push('Accent colour must keep at least 4.5:1 contrast against both dark canvases.');
  }
  if (!cornerRadiusOptions.includes(candidate.cornerRadius)) {
    errors.push('Corner radius is outside the approved token range.');
  }
  if (!baseSpacingOptions.includes(candidate.baseSpacing)) {
    errors.push('Base spacing is outside the approved token range.');
  }
  if (!textWeightOptions.includes(candidate.textWeight)) {
    errors.push('Text weight is outside the approved token range.');
  }

  if (errors.length) return { ok: false, errors, theme: null };
  return {
    ok: true,
    errors: [],
    theme: {
      accentColor: candidate.accentColor.toLowerCase(),
      cornerRadius: candidate.cornerRadius,
      baseSpacing: candidate.baseSpacing,
      textWeight: candidate.textWeight,
    },
  };
}

export function serializeTheme(candidate) {
  const result = validateTheme(candidate);
  if (!result.ok) throw new Error(result.errors.join(' '));
  return `${JSON.stringify(result.theme, null, 2)}\n`;
}
