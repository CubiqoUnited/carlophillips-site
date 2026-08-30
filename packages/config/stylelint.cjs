const rawLength =
  '/(?:^|\\s|\\()[-+]?(?:\\d*\\.)?\\d+(?:px|rem|em|vh|vw|svh)\\b/';
const rawColor = '/#[0-9a-f]{3,8}\\b|rgba?\\(|hsla?\\(/i';

module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['apply', 'layer', 'tailwind'] },
    ],
    'color-hex-length': null,
    'custom-property-empty-line-before': null,
    'custom-property-pattern': null,
    'declaration-property-value-disallowed-list': {
      '/^(?:background|background-color|border|border-color|box-shadow|color|fill|outline|text-shadow)$/':
        [rawColor],
      '/^(?:border-radius|column-gap|font-size|gap|height|margin(?:-.*)?|max-height|max-width|min-height|min-width|padding(?:-.*)?|row-gap|width)$/':
        [rawLength],
    },
    'import-notation': null,
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'value-keyword-case': null,
  },
  overrides: [
    {
      files: ['**/tokens.css'],
      rules: { 'declaration-property-value-disallowed-list': null },
    },
  ],
};
