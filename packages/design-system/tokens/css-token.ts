export type CssToken<Name extends string = string> = `var(--cp-${Name})`;

export function cssToken<Name extends string>(name: Name): CssToken<Name> {
  return `var(--cp-${name})`;
}
