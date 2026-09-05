import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './index';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  args: { children: 'Action' },
  render: () => (
    <div className="cp-story-canvas cp-story-stack">
      <span className="cp-label">Button states</span>
      <div className="cp-story-row">
        <Button variant="solid">Solid action</Button>
        <Button variant="outline">Outline action</Button>
        <Button variant="quiet">Quiet action</Button>
        <Button variant="outline" size="large">
          Large action
        </Button>
        <Button variant="outline" disabled>
          Disabled action
        </Button>
        <Button variant="solid" width="full" busy>
          Adding...
        </Button>
      </div>
    </div>
  ),
};
