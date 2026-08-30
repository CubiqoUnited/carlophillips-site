import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MediaFrame } from './index';

const meta = {
  title: 'Primitives/Media',
  component: MediaFrame,
  tags: ['autodocs'],
} satisfies Meta<typeof MediaFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ratios: Story = {
  args: { children: 'Approved media' },
  render: () => (
    <div className="cp-story-canvas cp-story-media-grid">
      <MediaFrame aspect="portrait">
        <div className="cp-story-media-placeholder">Portrait / 4:5</div>
      </MediaFrame>
      <MediaFrame aspect="featured">
        <div className="cp-story-media-placeholder">Featured / 5:4</div>
      </MediaFrame>
      <MediaFrame aspect="wide">
        <div className="cp-story-media-placeholder">Wide / 16:10</div>
      </MediaFrame>
    </div>
  ),
};
