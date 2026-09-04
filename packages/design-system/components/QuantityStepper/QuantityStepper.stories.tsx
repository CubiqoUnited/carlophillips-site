import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QuantityStepper } from './index';

const meta = {
  title: 'Commerce/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function BoundedExample() {
  const [value, setValue] = useState(1);
  return (
    <div className="cp-story-canvas">
      <QuantityStepper
        id="story-quantity"
        min={1}
        max={5}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}

export const Bounded: Story = {
  args: { id: 'story-quantity', max: 5, value: 1, onChange: () => undefined },
  render: () => <BoundedExample />,
};
