import { ImageResponse } from 'next/og';
import {
  openGraphTokens,
  serializedColors,
} from '@repo/design-system/serialized-tokens';

export const runtime = 'edge';
export const alt = 'CARLOPHILLIPS - Gesture of Luxury';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: serializedColors.canvasDeep,
        color: serializedColors.ink,
        padding: openGraphTokens.padding,
        fontFamily: openGraphTokens.fontFamily,
      }}
    >
      <div
        style={{
          fontSize: openGraphTokens.labelSize,
          letterSpacing: openGraphTokens.labelTracking,
        }}
      >
        CARLOPHILLIPS
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: openGraphTokens.displaySize,
          lineHeight: openGraphTokens.displayLeading,
          letterSpacing: openGraphTokens.displayTracking,
        }}
      >
        Gesture of Luxury
      </div>
      <div
        style={{
          fontSize: openGraphTokens.noteSize,
          color: serializedColors.copySoft,
        }}
      >
        First release in preparation
      </div>
    </div>,
    size
  );
}
