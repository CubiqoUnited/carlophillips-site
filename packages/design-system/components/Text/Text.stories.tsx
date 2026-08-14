import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './index';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  tags: ['autodocs'],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hierarchy: Story = {
  args: { children: 'Editorial copy' },
  render: () => (
    <div className="cp-story-canvas cp-story-stack">
      <Text as="h1" role="section-heading" tone="ink">
        Editorial control room
      </Text>
      <Text as="h2" role="product-heading" tone="copy">
        Signature Hoodie
      </Text>
      <Text role="body-large">
        Deliberate hierarchy, generous spacing, and no page-level visual drift.
      </Text>
      <Text role="label" tone="muted">
        Approved system copy
      </Text>
    </div>
  ),
};
