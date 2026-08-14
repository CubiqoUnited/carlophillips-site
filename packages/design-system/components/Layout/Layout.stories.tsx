import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Layout } from './index';
import { Text } from '../Text';

const meta = {
  title: 'Primitives/Layout',
  component: Layout,
  tags: ['autodocs'],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WidthAndRhythm: Story = {
  args: { children: 'Layout content' },
  render: () => (
    <div className="cp-story-canvas">
      <Layout width="wide" spacing="section">
        <div className="cp-story-layout-panel">
          <Text role="label">Wide editorial shell</Text>
        </div>
      </Layout>
      <Layout width="medium" spacing="section">
        <div className="cp-story-layout-panel">
          <Text role="label">Medium editorial shell</Text>
        </div>
      </Layout>
    </div>
  ),
};
