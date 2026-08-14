module.exports = {
  extends: ['./packages/config/eslint-visual.cjs', 'next/core-web-vitals'],
  ignorePatterns: ['**/.next/**', '**/storybook-static/**', 'test_reports/**'],
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
  overrides: [
    {
      files: ['apps/web/src/app/opengraph-image.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
