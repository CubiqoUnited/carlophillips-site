const base = require('./eslint.cjs');

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name.name='style']",
        message:
          'Inline visual styles bypass the CARLOPHILLIPS design-token contract.',
      },
      {
        selector:
          "JSXAttribute[name.name='className'] Literal[value=/((^|\\s)(?:bg|text|border)-(?:black|white)|(^|\\s)(?:mt|mb|ml|mr|mx|my|p|pt|pb|pl|pr|px|py|gap|space-[xy])-11(?:\\s|$)|(^|\\s)text-3xl(?:\\s|$)|(^|\\s)max-w-6xl(?:\\s|$)|\\[[^\\]]*(px|rem|em|vh|vw|#[0-9a-f]))/i]",
        message:
          'Raw visual utilities are forbidden in primitives; use a cp-* semantic class backed by tokens.',
      },
      {
        selector: "JSXAttribute[name.name='strokeWidth'] Literal",
        message:
          'Raw SVG stroke widths are visual values; bind them through a design-system primitive.',
      },
    ],
  },
};
