import type { Preview } from '@storybook/react';
import '../styles/index.css';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'control-room' },
    controls: { expanded: true },
    layout: 'fullscreen',
  },
};

export default preview;
