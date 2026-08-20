module.exports = {
  extends: ['./packages/config/eslint-visual.cjs', 'next/core-web-vitals'],
  ignorePatterns: ['**/.next/**', '**/storybook-static/**', 'test_reports/**'],
  rules: {
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
  overrides: [
    {
      files: [
        'apps/web/src/**/*.tsx',
        'apps/web/src/**/*.ts',
        'apps/web/src/**/*.jsx',
        'apps/web/src/**/*.js',
      ],
      rules: {
        'no-restricted-syntax': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
  ],
};
