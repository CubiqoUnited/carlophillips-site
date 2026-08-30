const restrictedImports = [
  {
    patterns: [
      {
        group: ['@/components/ui/*', '**/components/ui/*'],
        message:
          'Storefront code must consume @repo/design-system primitives, not a parallel component library.',
      },
      {
        group: [
          '@repo/design-system/components/*',
          '@repo/design-system/themes/*',
          '@repo/design-system/tokens/*',
          '@repo/design-system/styles/*',
        ],
        message:
          'Use the documented @repo/design-system package exports instead of deep visual imports.',
      },
    ],
  },
];

module.exports = {
  env: { browser: true, es2022: true, node: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    'no-restricted-imports': ['error', ...restrictedImports],
  },
};
