import { validateTheme } from './theme-contract';

const spacingScale = Object.freeze([
  ['025', 0.25],
  ['045', 0.45],
  ['050', 0.5],
  ['055', 0.55],
  ['060', 0.6],
  ['065', 0.65],
  ['075', 0.75],
  ['078', 0.78],
  ['080', 0.8],
  ['085', 0.85],
  ['095', 0.95],
  ['100', 1],
  ['105', 1.05],
  ['110', 1.1],
  ['125', 1.25],
  ['150', 1.5],
  ['175', 1.75],
  ['200', 2],
  ['225', 2.25],
  ['250', 2.5],
  ['300', 3],
  ['350', 3.5],
  ['400', 4],
  ['450', 4.5],
  ['500', 5],
  ['600', 6],
  ['700', 7],
  ['800', 8],
]);

function formatRem(baseSpacing, multiplier) {
  const value = Number.parseFloat(baseSpacing) * multiplier;
  return `${Number(value.toFixed(6))}rem`;
}

export function themePrimitiveEntries(candidate) {
  const result = validateTheme(candidate);
  if (!result.ok) throw new Error(result.errors.join(' '));
  const theme = result.theme;
  const entries = [
    ['--cp-primitive-color-accent', theme.accentColor],
    ['--cp-primitive-font-weight-light', String(theme.textWeight)],
    ['--cp-primitive-radius-none', theme.cornerRadius],
  ];

  for (const [suffix, multiplier] of spacingScale) {
    entries.push([`--cp-primitive-space-${suffix}`, formatRem(theme.baseSpacing, multiplier)]);
  }
  /*
   * Negative offsets are emitted only for steps an active surface consumes. An emitted value that no
   * rule reaches is a dormant token, which the design-system suite treats as a release blocker.
   */
  entries.push(['--cp-primitive-space-negative-050', `-${formatRem(theme.baseSpacing, 0.5)}`]);
  return entries;
}

export function buildThemeCss(candidate) {
  const declarations = themePrimitiveEntries(candidate)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `:root {\n${declarations}\n}`;
}
