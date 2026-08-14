const shared = require('../../packages/config/tailwind.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...shared,
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    '../../packages/design-system/**/*.{js,jsx,ts,tsx}',
  ],
};
