import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Layout } from './Layout';
import { MediaFrame } from './Media';
import { Text } from './Text';

const meta = {
  title: 'Control Room/Overview',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundations: Story = {
  render: () => (
    <main className="cp-story-canvas">
      <Layout spacing="section">
        <div className="cp-story-stack">
          <Text role="label" tone="muted">
            CARLOPHILLIPS / Design System
          </Text>
          <Text as="h1" role="section-heading" tone="ink">
            The control room
          </Text>
          <Text role="body-large">
            Tokens govern every visual decision. Primitives expose the approved
            vocabulary to the storefront.
          </Text>
          <div className="cp-story-row">
            <Button variant="solid">Primary action</Button>
            <Button variant="outline">Secondary action</Button>
            <Button variant="quiet">Editorial action</Button>
          </div>
          <div className="cp-story-media-grid">
            <MediaFrame aspect="portrait">
              <div className="cp-story-media-placeholder">Portrait media</div>
            </MediaFrame>
            <MediaFrame aspect="featured">
              <div className="cp-story-media-placeholder">Featured media</div>
            </MediaFrame>
            <MediaFrame aspect="wide">
              <div className="cp-story-media-placeholder">Wide media</div>
            </MediaFrame>
          </div>
        </div>
      </Layout>
    </main>
  ),
};
